import mongoose from "mongoose";

const parkingSlotSchema = new mongoose.Schema(
    {

        slotNumber: {
            type: String,
            required: [true, "Slot number is required"],
            trim: true,
        },

        vehicleType: {
            type: String,
            enum: ["car", "bike", "ev"],
            default: "car",
        },

        status: {
            type: String,
            enum: ["available", "occupied", "reserved", "unavailable"],
            default: "available",
        },


        currentVehicle: {
            plateNumber: { type: String, trim: true, uppercase: true },
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            checkInTime: { type: Date },
            expectedCheckout: { type: Date },
        },

        isSmartSlot: {
            type: Boolean,
            default: false,
        },
        hasSensor: {
            type: Boolean,
            default: false,
        },
        simulated: {
            type: Boolean,
            default: true,
        },

        stats: {
            totalParkings: { type: Number, default: 0 },
            totalEarnings: { type: Number, default: 0 },
            averageOccupancyDuration: { type: Number, default: 0 },
        },


        lastStatusChange: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);


parkingSlotSchema.index({ slotNumber: 1 });

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);

export default ParkingSlot;
