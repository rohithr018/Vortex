import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Kafka } from 'kafkajs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
const KAFKA_BROKER = process.env.KAFKA_BROKER;
const KAFKA_TOPIC = process.env.KAFKA_TOPIC;
const REPO = process.env.REPO;
const REGION = process.env.REGION;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET;
const BRANCH = process.env.BRANCH

const kafka = new Kafka({
    clientId: 'deployment',
    brokers: [KAFKA_BROKER]
});

const producer = kafka.producer();
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
    }
});

async function publishLog(logMessage, logLevel = 'info') {
    await producer.send({
        topic: KAFKA_TOPIC,
        messages: [{
            key: 'log',
            value: JSON.stringify({
                deployment_id: DEPLOYMENT_ID,
                log_message: logMessage,
                log_level: logLevel
            })
        }]
    });
}

function detectBuildStrategy(projectPath) {
    const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
    const hasPom = fs.existsSync(path.join(projectPath, 'pom.xml'));
    const hasGradle = fs.existsSync(path.join(projectPath, 'build.gradle'));

    if (hasPom) return 'java-maven';
    if (hasGradle) return 'java-gradle';

    if (hasPackageJson) {
        const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8'));
        const scripts = pkg.scripts || {};
        if (scripts['build']) {
            if (fs.existsSync(path.join(projectPath, 'next.config.js'))) return 'nextjs';
            if (fs.existsSync(path.join(projectPath, 'vite.config.js'))) return 'vite';
            return 'node';
        }
    }

    return 'static';
}

function getBuildCommand(strategy, projectPath) {
    try {
        if (['nextjs', 'vite', 'node'].includes(strategy)) {
            const pkgPath = path.join(projectPath, 'package.json');
            if (!fs.existsSync(pkgPath)) return 'npm install';

            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            const scripts = pkg.scripts || {};
            let commands = [];

            if (scripts.install) {
                commands.push('npm run install');
            } else {
                commands.push('npm install');
            }

            if (scripts.build) {
                commands.push('npm run build');
            }

            return commands.join(' && ');
        }

        if (strategy === 'java-maven') return 'mvn clean install';
        if (strategy === 'java-gradle') return './gradlew build || gradle build';

        return '';
    } catch (err) {
        return '';
    }
}

async function uploadFileToS3(filePath, relativePath, folderToUpload) {
    try {
        const fileStream = fs.createReadStream(filePath);

        fileStream.on('error', (err) => {
            throw new Error(`File stream error: ${err.message}`);
        });

        const key = `__outputs/${DEPLOYMENT_ID}/${path.relative(folderToUpload, filePath)}`;

        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: fileStream,
            ContentType: mime.lookup(filePath) || 'application/octet-stream'
        });

        await s3Client.send(command);
        return { success: true, key };
    } catch (err) {
        return {
            success: false,
            error: err.message,
            filePath: relativePath
        };
    }
}


async function uploadFolderToS3(folderToUpload) {
    try {
        const allFiles = [];

        // Recursively get all files in directory
        function walkDir(currentPath) {
            const files = fs.readdirSync(currentPath);
            for (const file of files) {
                const fullPath = path.join(currentPath, file);
                if (fs.lstatSync(fullPath).isDirectory()) {
                    walkDir(fullPath);
                } else {
                    allFiles.push(fullPath);
                }
            }
        }

        walkDir(folderToUpload);

        await publishLog(`Found ${allFiles.length} files to upload`);

        const uploadResults = [];
        const batchSize = 5;
        let uploadedCount = 0;

        for (let i = 0; i < allFiles.length; i += batchSize) {
            const batch = allFiles.slice(i, i + batchSize);
            const batchRelativePaths = batch.map(filePath => path.relative(folderToUpload, filePath));

            await publishLog(`Uploading batch ${Math.floor(i / batchSize) + 1}:`);
            for (const file of batchRelativePaths) {
                await publishLog(` - ${file}`);
            }

            const batchResults = await Promise.all(
                batch.map(filePath => {
                    const relativePath = path.relative(folderToUpload, filePath);
                    return uploadFileToS3(filePath, relativePath, folderToUpload);
                })
            );

            uploadResults.push(...batchResults);
            uploadedCount += batchResults.length;

            await publishLog(`Uploaded ${uploadedCount}/${allFiles.length} files`);
        }

        const failures = uploadResults.filter(result => !result.success);
        if (failures.length > 0) {
            await publishLog(`Failed to upload ${failures.length} files`, 'ERROR');
            for (const failure of failures) {
                await publishLog(`Failed to upload ${failure.filePath}: ${failure.error}`, 'ERROR');
            }
            return false;
        }

        return true;
    } catch (err) {
        await publishLog(`Folder upload failed: ${err.message}`, 'ERROR');
        return false;
    }
}

async function cleanupFolder(folderPath) {
    try {
        fs.rmSync(folderPath, { recursive: true, force: true });
        await publishLog(`Cleaned up local build folder: ${folderPath}`, 'INFO');
    } catch (err) {
        await publishLog(`Failed to cleanup folder ${folderPath}: ${err.message}`, 'ERROR');
    }
}

async function init() {
    await producer.connect();
    await publishLog('Deployment process started...', 'INFO');
    await publishLog(`Deployment ID: ${DEPLOYMENT_ID}`, 'INFO');
    await publishLog(`Cloning Project Into /home/app/${REPO}...`, 'INFO');
    await publishLog(`Checking out to ${BRANCH}`, 'INFO');
    await publishLog('Build process started...', 'INFO');

    const projectPath = `/home/app/${REPO}`;
    const strategy = detectBuildStrategy(projectPath);
    await publishLog(`Detected build strategy: ${strategy}`, 'INFO');

    await publishLog('Installing dependencies and preparing build...', 'INFO');
    const buildCommand = getBuildCommand(strategy, projectPath);

    await publishLog(`Running build command: ${buildCommand}`, 'INFO');

    if (!buildCommand) {
        await publishLog('No build command detected. Skipping build.', 'WARN');
        process.exit(0);
    }

    const p = exec(`cd ${projectPath} && ${buildCommand}`);

    p.stdout.on('data', async (data) => {
        const logData = data.toString();
        await publishLog(`${logData}`, 'INFO');
    });

    p.stderr?.on('data', async (data) => {
        const logError = data.toString();
        await publishLog(`${logError}`, 'ERROR');
    });

    p.on('close', async (code) => {
        await publishLog(`Build process exited with code ${code}`, 'INFO');
        await publishLog('Analyzing build output directories...', 'INFO');

        const distFolderPath = path.join(projectPath, 'dist');
        const buildFolderPath = path.join(projectPath, 'build');
        const targetFolderPath = path.join(projectPath, 'target');

        let folderToUpload = null;
        if (fs.existsSync(distFolderPath)) {
            folderToUpload = distFolderPath;
            await publishLog('Found "dist" folder. Using it as deployment output.', 'INFO');
        } else if (fs.existsSync(buildFolderPath)) {
            folderToUpload = buildFolderPath;
            await publishLog('Found "build" folder. Using it as deployment output.', 'INFO');
        } else if (fs.existsSync(targetFolderPath)) {
            folderToUpload = targetFolderPath;
            await publishLog('Found "target" folder. Using it as deployment output.', 'INFO');
        }

        if (!folderToUpload) {
            await publishLog('No dist, build, or target folder found. Exiting Deployment.', 'ERROR');
            process.exit(1);
        }

        const folderContents = fs.readdirSync(folderToUpload, { recursive: true });
        await publishLog(`Build artifacts ready. ${folderContents.length} items to upload.`, 'INFO');
        const uploadSuccess = await uploadFolderToS3(folderToUpload);

        if (!uploadSuccess) {
            await publishLog('Deployment failed due to upload errors', 'ERROR');
            process.exit(1);
        }

        await cleanupFolder(folderToUpload);
        await publishLog('Deployment completed successfully!', 'INFO');
        process.exit(0);
    });
}

init();
