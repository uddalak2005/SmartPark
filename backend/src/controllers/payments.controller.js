import User from "../models/user.model.js";
import Joi from "joi";
import jwt from "jsonwebtoken";
import ParkingSpace from "../models/parkingSpaces.model.js";
import ParkingSlot from "../models/parkingSlot.model.js";
import BookingSession from "../models/booking.model.js";

class PaymentsController {

    async generateUTR(req, res) {
        try {
            const { bookingToken } = req.body || req.headers;

            if (!bookingToken) {
                return res.status(400).json({
                    success: false,
                    message: "Booking token is required to cancel the session",
                });
            }

            // Verify booking token
            let decoded;
            try {
                decoded = jwt.verify(bookingToken, process.env.BOOKING_SECRET);
            } catch (err) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired booking token",
                });
            }

            const { bookingId, zoneId, slotId } = decoded;

            // Find booking session
            const bookingSession = await BookingSession.findById(bookingId);
            if (!bookingSession) {
                return res.status(404).json({
                    success: false,
                    message: "Booking session not found",
                });
            }

            // Check if already cancelled or used
            if (bookingSession.status !== "ongoing") {
                return res.status(400).json({
                    success: false,
                    message: "This booking cannot be cancelled (already used or cancelled)",
                });
            }

            return res.status(200).json({
                order: {
                    id: bookingId
                }
            });

        } catch (err) {
            console.error("Error fetching UTR:", err);
            res.status(500).json({
                success: false,
                message: "Server error while fetching UTR",
                error: err.message,
            });
        }
    }
}

const paymentsController = new PaymentsController();
export default paymentsController; 