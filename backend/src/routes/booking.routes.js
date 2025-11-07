import bookingController from "../controllers/booking.cotroller.js";
import express from "express";

const router = express.Router();

router.post("/bookSlot", (req,res,next) => {console.log(req.body);next()}, bookingController.bookParkingSlot);
router.post("/startSession", bookingController.startParkingSession);

export default router;