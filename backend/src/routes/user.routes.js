import express from "express";
import userController from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/register", upload.single("vehiclePhoto"), userController.registerUser);

export default router;