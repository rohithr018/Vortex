import express from 'express';
import { getLogsByDeploymentId } from '../controllers/log.controller.js';
const router = express.Router();

router.get('/:id', getLogsByDeploymentId);

export default router;
