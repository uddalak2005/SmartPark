import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import BookingSession from "../models/booking.model.js";

class PaymentsController {

    async generateUTR(req, res) {
        try {

            console.log(process.env.RAZORPAY_KEY_ID);
            console.log(process.env.RAZORPAY_KEY_SECRET);

            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            const { bookingToken, amount } = req.body || req.headers;

            console.log(amount);

            // Validate required fields
            if (!bookingToken) {
                return res.status(400).json({
                    success: false,
                    message: "Booking token is required.",
                });
            }

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: "Payment amount is required.",
                });
            }

            // Verify booking token
            let decoded;
            try {
                decoded = jwt.verify(bookingToken, process.env.BOOKING_SECRET);
            } catch (err) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired booking token.",
                });
            }

            const { bookingId } = decoded;

            console.log(bookingId);

            // Find booking session
            const bookingSession = await BookingSession.findById(bookingId);
            if (!bookingSession) {
                return res.status(404).json({
                    success: false,
                    message: "Booking session not found.",
                });
            }

            // Ensure booking is still active
            if (bookingSession.status !== "ongoing") {
                return res.status(400).json({
                    success: false,
                    message: "This booking cannot be paid for (already used or cancelled).",
                });
            }

            // Create Razorpay order
            const options = {
                amount: amount*100, // amount in paise
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                notes: {
                    bookingId,
                    userId: bookingSession.user.toString(),
                },
            };

            const order = await razorpay.orders.create(options);

            // Optionally, you can attach the order ID to bookingSession for reference
            bookingSession.paymentOrderId = order.id;
            await bookingSession.save();

            return res.status(200).json({
                success: true,
                message: "UTR (order) generated successfully.",
                bookingId,
                order,
            });
        } catch (err) {
            console.error("Error generating UTR:", err);
            return res.status(500).json({
                success: false,
                message: "Server error while generating UTR.",
                error: err.message,
            });
        }
    }
}

const paymentsController = new PaymentsController();
export default paymentsController;