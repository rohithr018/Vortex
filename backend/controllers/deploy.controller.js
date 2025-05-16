import { execSync, exec } from 'child_process';
import Deployment from '../models/deployment.model.js';

export const deployProject = async (req, res) => {
    try {
        const { repo, branch, username, deploymentId, envVars } = req.body;

        if (!repo || !branch || !username || !deploymentId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const getLocalIP = () => {
            try {
                return execSync("hostname -I | awk '{print $1}'").toString().trim();
            } catch {
                return null;
            }
        };

        const localIP = getLocalIP();
        if (!localIP) {
            return res.status(500).json({ error: 'Could not retrieve local IP' });
        }

        const kafkaBroker = `${localIP}:29092`;
        const containerName = `builder-${deploymentId}`;
        try {
            execSync(`docker rm -f ${containerName}`);
        } catch {
        }

        const dockerRunCommand = [
            `docker run -d`,
            `--name ${containerName}`,
            `-e REPO=${repo}`,
            `-e BRANCH=${branch}`,
            `-e USERNAME=${username}`,
            `-e DEPLOYMENT_ID=${deploymentId}`,
            `-e KAFKA_BROKER=${kafkaBroker}`,
            `-e ENV='${JSON.stringify(envVars)}'`,
            'rohith1809/build-server-image:latest'
        ].join(' ');

        const containerId = execSync(dockerRunCommand).toString().trim();
        res.status(200).json({ message: 'Deployment started', deploymentId: deploymentId });

        exec(`docker wait ${containerName}`, (err, stdout) => {
            const exitCode = stdout?.trim();
        });

    } catch {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createDeployment = async (req, res) => {
    try {
        const { deploymentId, repoName, branch, username, logs, url } = req.body;

        if (!deploymentId || !repoName || !branch || !username || !url) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const existingDeployment = await Deployment.findOne({ deploymentId });

        if (existingDeployment) {
            existingDeployment.repoName = repoName;
            existingDeployment.branch = branch;
            existingDeployment.username = username;
            existingDeployment.logs = logs || [];
            existingDeployment.url = url;

            await existingDeployment.save();

            return res.status(200).json({
                message: 'Deployment updated successfully',
                deployment: existingDeployment,
            });
        } else {
            const newDeployment = new Deployment({
                deploymentId,
                repoName,
                branch,
                username,
                logs: logs || [],
                url,
            });

            await newDeployment.save();

            return res.status(201).json({
                message: 'Deployment created successfully',
                deployment: newDeployment,
            });
        }
    } catch (error) {
        console.error('Error creating deployment:', error);
        res.status(500).json({ message: 'Server error while creating deployment' });
    }
};



export const getDeploymentByRepoAndUser = async (req, res) => {
    try {
        const { repoName, username } = req.query;

        if (!repoName || !username) {
            return res.status(400).json({ message: 'repoName and username are required' });
        }

        const deploymentExists = await Deployment.exists({ repoName, username });

        res.status(200).json({ exists: !!deploymentExists });
    } catch (error) {
        console.error('Error checking deployment existence:', error);
        res.status(500).json({ message: 'Server error while checking deployment existence' });
    }
};

export const getDeploymentsByUser = async (req, res) => {
    try {
        const { user } = req.query;

        if (!user) {
            return res.status(400).json({ message: "User parameter is required" });
        }

        const deployments = await Deployment.find({ username: user });
        res.status(200).json(deployments);
    } catch (err) {
        console.error("Error fetching deployments:", err);
        res.status(500).json({ message: "Server error" });
    }
};

