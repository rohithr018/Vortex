import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });

export const getBranches = async (req, res) => {
    try {
        const { repoUrl } = req.body;
        const [_, owner, repo] = new URL(repoUrl).pathname.split('/');
        const { data } = await octokit.repos.listBranches({ owner, repo });
        res.json(data.map(branch => branch.name));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
};

export const getCommits = async (req, res) => {
    try {
        const { repoUrl, branch } = req.body;
        const [_, owner, repo] = new URL(repoUrl).pathname.split('/');
        const { data } = await octokit.repos.listCommits({ owner, repo, sha: branch });
        res.json(data.map(commit => ({ sha: commit.sha, message: commit.commit.message })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch commits' });
    }
};