import paymentsController from "../controllers/payments.controller.js";
import express from "express";

const router = express.Router();

router.post("/generateUTR", paymentsController.generateUTR);

export default router;