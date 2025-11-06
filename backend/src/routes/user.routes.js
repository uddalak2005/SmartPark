import express from "express";
import userController from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/register", upload.single("vehiclePhoto"), userController.registerUser);
router.post("/login/:firebaseId", (req,res,next) => {console.log(req); return next()}, userController.login);

export default router;