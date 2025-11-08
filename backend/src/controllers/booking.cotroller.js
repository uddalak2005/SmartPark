import Joi from "joi";
import jwt from "jsonwebtoken";
import ParkingSpace from "../models/parkingSpaces.model.js";
import ParkingSlot from "../models/parkingSlot.model.js";
import BookingSession from "../models/booking.model.js";

class BookingController {
    async bookParkingSlot(req, res) {
        try {
            console.log(req.body);
            const schema = Joi.object({
                userId: Joi.string().required(),
                zoneId: Joi.string().required(),
                departureLocation: Joi.object({
                    lat: Joi.number().required(),
                    lon: Joi.number().required(),
                }).required(),
                destinationLocation: Joi.object({
                    lat: Joi.number().required(),
                    lon: Joi.number().required(),
                }).required(),
                ETA: Joi.date().required(),
                timeOfBooking: Joi.date().default(Date.now),
            });

            const { error, value } = schema.validate(req.body);
            if (error)
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message,
                });

            const {
                userId,
                zoneId,
                departureLocation,
                destinationLocation,
                ETA,
                timeOfBooking,
            } = value;


            const parkingSpace = await ParkingSpace.findById(zoneId).populate("slots");
            if (!parkingSpace)
                return res
                    .status(404)
                    .json({ success: false, message: "Parking space not found" });

            const availableSlot = await ParkingSlot.findOne({
                _id: { $in: parkingSpace.slots },
                status: "available",
            });

            if (!availableSlot) {
                return res.status(400).json({
                    success: false,
                    message: "No available slots in this parking zone",
                });
            }

            availableSlot.status = "reserved";
            availableSlot.currentVehicle = {
                user: userId,
                checkInTime: new Date(),
            };
            await availableSlot.save();

            parkingSpace.availableSlots = Math.max(parkingSpace.availableSlots - 1, 0);
            await parkingSpace.save();


            const bookingSession = await BookingSession.create({
                user: userId,
                parkingSpace: zoneId,
                slot: availableSlot._id,
                departureLocation,
                destinationLocation,
                ETA,
                timeOfBooking,
                status: "active",
            });


            const sessionData = {
                bookingId: bookingSession._id,
                userId,
                zoneId,
                slotId: availableSlot._id,
                ETA,
            };

            const bookingToken = jwt.sign(sessionData, process.env.BOOKING_SECRET, {
                expiresIn: "2h",
            });

            bookingSession.bookingToken = bookingToken;
            await bookingSession.save();


            return res.status(201).json({
                success: true,
                message: "Parking slot booked successfully",
                data: {
                    bookingId: bookingSession._id,
                    zoneId,
                    slotId: availableSlot._id,
                    ETA,
                    bookingToken,
                },
            });
        } catch (err) {
            console.error("Error booking slot:", err);
            res.status(500).json({
                success: false,
                message: "Server error while booking parking slot",
                error: err.message,
            });
        }
    }

    async startParkingSession(req, res) {
        try {
            console.log(req.body);
            const { bookingToken } = req.body || req.headers;

            if (!bookingToken) {
                return res.status(400).json({
                    success: false,
                    message: "Booking token is required to start parking session",
                });
            }

            // Verify the booking token
            let decoded;
            try {
                decoded = jwt.verify(bookingToken, process.env.BOOKING_SECRET);
            } catch (err) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired booking token",
                });
            }

            const { bookingId, userId, zoneId, slotId, ETA } = decoded;

            // Fetch booking session
            const bookingSession = await BookingSession.findById(bookingId)
                .populate("slot")
                .populate("parkingSpace");

            if (!bookingSession)
                return res.status(404).json({
                    success: false,
                    message: "Booking session not found",
                });

            if (bookingSession.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message: "This booking cannot be started (already used or cancelled)",
                });
            }

            // Mark slot as occupied
            const slot = await ParkingSlot.findById(slotId);
            if (!slot)
                return res.status(404).json({
                    success: false,
                    message: "Slot not found",
                });

            slot.status = "occupied";
            slot.currentVehicle = {
                user: userId,
                checkInTime: new Date(),
            };
            await slot.save();

            // Update booking session
            bookingSession.status = "ongoing";
            bookingSession.checkInTime = new Date();

            // Generate parking token (for billing session)
            const parkingTokenPayload = {
                bookingId,
                userId,
                zoneId,
                slotId,
                startTime: bookingSession.checkInTime,
            };

            const parkingToken = jwt.sign(parkingTokenPayload, process.env.PARKING_SECRET, {
                expiresIn: "6h", // valid for parking duration
            });

            bookingSession.parkingToken = parkingToken;
            await bookingSession.save();

            // Update parking space available slot count
            await ParkingSpace.findByIdAndUpdate(zoneId, {
                $inc: { availableSlots: -1 },
            });

            return res.status(200).json({
                success: true,
                message: "Parking session started successfully",
                data: {
                    bookingId,
                    slotId,
                    zoneId,
                    checkInTime: bookingSession.checkInTime,
                    parkingToken,
                },
            });
        } catch (err) {
            console.error("Error starting parking session:", err);
            res.status(500).json({
                success: false,
                message: "Server error while starting parking session",
                error: err.message,
            });
        }
    }

    async cancelBookingSession(req, res) {
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
            if (bookingSession.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message: "This booking cannot be cancelled (already used or cancelled)",
                });
            }

            // Mark booking as cancelled before deletion
            bookingSession.status = "cancelled";
            await bookingSession.save();

            // Free up the slot
            const slot = await ParkingSlot.findById(slotId);
            if (slot) {
                slot.status = "available";
                slot.currentVehicle = null;
                await slot.save();
            }

            // Increase available slot count for the zone
            await ParkingSpace.findByIdAndUpdate(zoneId, {
                $inc: { availableSlots: 1 },
            });

            // Delete the booking session record
            await BookingSession.findByIdAndDelete(bookingId);

            return res.status(200).json({
                success: true,
                message: "Booking session cancelled and deleted successfully",
                data: {
                    bookingId,
                    slotId,
                    zoneId,
                },
            });
        } catch (err) {
            console.error("Error cancelling booking session:", err);
            res.status(500).json({
                success: false,
                message: "Server error while cancelling booking session",
                error: err.message,
            });
        }
    }

    async completeParkingSession(req, res) {
        try {
            console.log(req.body);
            const { parkingToken } = req.body || req.headers;

            if (!parkingToken) {
                return res.status(400).json({
                    success: false,
                    message: "Parking token is required to complete the session",
                });
            }

            // Verify the parking token
            let decoded;
            try {
                decoded = jwt.verify(parkingToken, process.env.PARKING_SECRET);
            } catch (err) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired parking token",
                });
            }

            const { bookingId, userId, zoneId, slotId, startTime } = decoded;

            // Fetch booking session
            const bookingSession = await BookingSession.findById(bookingId)
                .populate("slot")
                .populate("parkingSpace");

            if (!bookingSession)
                return res.status(404).json({
                    success: false,
                    message: "Booking session not found",
                });

            if (bookingSession.status !== "ongoing") {
                return res.status(400).json({
                    success: false,
                    message: "This booking cannot be completed (not ongoing)",
                });
            }

            // Mark slot as free again
            const slot = await ParkingSlot.findById(slotId);
            if (!slot)
                return res.status(404).json({
                    success: false,
                    message: "Slot not found",
                });

            slot.status = "available";
            slot.currentVehicle = null;
            await slot.save();

            // Mark booking session as completed
            bookingSession.status = "completed";
            bookingSession.checkOutTime = new Date();

            // Calculate duration and cost (example: ₹2 per minute)
            const durationMs = new Date() - new Date(startTime);
            const durationMins = Math.ceil(durationMs / 60000);
            const ratePerMin = 2;
            const totalCost = durationMins * ratePerMin;

            bookingSession.billAmount = totalCost;
            await bookingSession.save();

            // Update available slot count
            await ParkingSpace.findByIdAndUpdate(zoneId, {
                $inc: { availableSlots: 1 },
            });

            // Optionally generate invoice or mark payment pending
            return res.status(200).json({
                success: true,
                message: "Parking session completed successfully",
                data: {
                    bookingId,
                    slotId,
                    durationMins,
                    totalCost,
                    checkOutTime: bookingSession.checkOutTime,
                },
            });
        } catch (err) {
            console.error("Error completing parking session:", err);
            res.status(500).json({
                success: false,
                message: "Server error while completing parking session",
                error: err.message,
            });
        }
    }

}

const bookingController = new BookingController();
export default bookingController;