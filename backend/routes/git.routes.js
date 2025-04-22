import express from 'express';
import { getRepos, getRepoBranches } from '../controllers/git.controller.js';

const router = express.Router();

// Route to get all repositories for a user
router.post('/repos', getRepos);

// Route to get specific repository details by owner and repo name
router.get('/branches/:owner/:repo', getRepoBranches);

export default router;
