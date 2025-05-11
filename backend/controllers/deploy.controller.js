import { execSync, exec } from 'child_process';

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
