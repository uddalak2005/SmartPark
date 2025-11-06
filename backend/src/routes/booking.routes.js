import bookingController from "../controllers/booking.cotroller.js";
import express from "express";

const router = express.Router();

router.post("/bookSlot", bookingController.bookParkingSlot);
router.post("/startSession", bookingController.startParkingSession);

export default router;