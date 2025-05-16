import express from "express";
import { getUserByUsername, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/getuser/:username", getUserByUsername);
router.put("/updateuser/:username", updateUser);
export default router;
