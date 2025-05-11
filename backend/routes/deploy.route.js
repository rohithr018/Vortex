
import express from 'express';
import { deployProject } from '../controllers/deploy.controller.js';
const router = express.Router();

router.post('/start', deployProject);


export default router;
