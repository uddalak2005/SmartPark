import bookingController from "../controllers/booking.cotroller.js";
import express from "express";

const router = express.Router();

router.post("/bookSlot", bookingController.bookParkingSlot);

export default router;