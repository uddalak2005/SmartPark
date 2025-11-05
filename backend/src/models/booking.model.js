import mongoose from "mongoose";

const bookingSessionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        parkingSpace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ParkingSpace",
            required: true,
        },
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ParkingSlot",
            required: true,
        },
        departureLocation: {
            lat: Number,
            lon: Number,
        },
        destinationLocation: {
            lat: Number,
            lon: Number,
        },
        ETA: { type: Date, required: true },
        timeOfBooking: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
        bookingToken: String,
    },
    { timestamps: true }
);

const BookingSession = mongoose.model("BookingSession", bookingSessionSchema);
export default BookingSession;