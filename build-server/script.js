import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { Kafka } from 'kafkajs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
const KAFKA_BROKER = process.env.KAFKA_BROKER;
const KAFKA_TOPIC = process.env.KAFKA_TOPIC;
const REPO = process.env.REPO;

console.log(KAFKA_BROKER);
const kafka = new Kafka({
    clientId: 'deployment',
    brokers: [KAFKA_BROKER]
});

const producer = kafka.producer();

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
        console.error("Error generating build command:", err);
        return '';
    }
}

async function init() {
    await producer.connect();
    console.log('Executing script.js');
    await publishLog('🚀 Build process started...', 'INFO');
    await publishLog(`📁 Cloning project into /home/app/${REPO}...`, 'INFO');

    const projectPath = `/home/app/${REPO}`;
    const strategy = detectBuildStrategy(projectPath);
    await publishLog(`🔍 Detected build strategy: ${strategy}`, 'INFO');

    await publishLog('📦 Installing dependencies and preparing build...', 'INFO');
    const buildCommand = getBuildCommand(strategy, projectPath);

    // console.log(`Detected build strategy: ${strategy}`);
    // console.log(`Running build command: ${buildCommand}`);
    await publishLog(`🛠️ Running build command: ${buildCommand}`, 'INFO');

    if (!buildCommand) {
        // console.log('No build command found. Skipping build.');
        await publishLog('⚠️ No build command detected. Skipping build.', 'WARNING');
        process.exit(0);
    }

    const p = exec(`cd ${projectPath} && ${buildCommand}`);

    p.stdout.on('data', async (data) => {
        const logData = data.toString();
        // console.log(logData);
        await publishLog(`📄 ${logData}`, 'INFO');
    });

    p.stderr?.on('data', async (data) => {
        const logError = data.toString();
        // console.error('Error: ', logError);
        await publishLog(`❌ ${logError}`, 'ERROR');
    });

    p.on('close', async (code) => {
        // console.log('Build Complete');
        await publishLog(`✅ Build process exited with code ${code}`, 'INFO');
        await publishLog('🔎 Analyzing build output directories...', 'INFO');

        const distFolderPath = path.join(projectPath, 'dist');
        const buildFolderPath = path.join(projectPath, 'build');
        const targetFolderPath = path.join(projectPath, 'target');

        let folderToUpload = null;
        if (fs.existsSync(distFolderPath)) {
            folderToUpload = distFolderPath;
            await publishLog('📂 Found "dist" folder. Using it as deployment output.', 'INFO');
        } else if (fs.existsSync(buildFolderPath)) {
            folderToUpload = buildFolderPath;
            await publishLog('📂 Found "build" folder. Using it as deployment output.', 'INFO');
        } else if (fs.existsSync(targetFolderPath)) {
            folderToUpload = targetFolderPath;
            await publishLog('📂 Found "target" folder. Using it as deployment output.', 'INFO');
        }

        if (!folderToUpload) {
            // console.error('No dist, build, or target folder found');
            await publishLog('🚫 No dist, build, or target folder found. Cannot proceed with deployment.', 'ERROR');
            process.exit(1);
        }

        const folderContents = fs.readdirSync(folderToUpload, { recursive: true });
        await publishLog(`📦 Build artifacts ready. ${folderContents.length} items to upload.`, 'INFO');

        // console.log("Skipping upload to S3...");
        await publishLog('📤 Skipping upload to S3 (upload handler not implemented).', 'INFO');

        console.log("Done...");
        await publishLog('🎉 Deployment script completed successfully.', 'INFO');
        process.exit(0);
    });
}

init();
