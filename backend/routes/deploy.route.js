
import express from 'express';
import { createDeployment, deployProject, getDeploymentByRepoAndUser, getDeploymentsByUser } from '../controllers/deploy.controller.js';
const router = express.Router();

router.post('/start', deployProject);
router.post('/create', createDeployment);
router.get('/get', getDeploymentByRepoAndUser);
router.get('/getdeploy', getDeploymentsByUser)


export default router;
