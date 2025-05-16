import express from 'express';
import { getRepos, getRepoBranches } from '../controllers/git.controller.js';

const router = express.Router();

router.post('/repos', getRepos);
router.get('/branches/:owner/:repo', getRepoBranches);

export default router;
