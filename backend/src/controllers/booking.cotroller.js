import Joi from "joi";
import jwt from "jsonwebtoken";
import ParkingSpace from "../models/parkingSpaces.model.js";
import ParkingSlot from "../models/parkingSlot.model.js";
import BookingSession from "../models/booking.model.js";

class BookingController {
    async bookParkingSlot(req, res) {
        try {

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
}

const bookingController = new BookingController();
export default bookingController;
