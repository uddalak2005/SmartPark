import mongoose from "mongoose";

const parkingSpaceSchema = new mongoose.Schema(
    {
        ownerType: {
            type: String,
            enum: ["platform", "user"],
            required: true,
            default: "user",
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: function () {
                return this.ownerType === "user";
            },
        },

        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
            address: String,
            landmark: String,
        },

        supportedVehicleTypes: {
            type: [String],
            enum: ["car", "bike", "ev"],
            default: ["car"],
        },

        pricing: {
            hourlyRate: { type: Number, required: true },
            dailyRate: { type: Number },
            currency: { type: String, default: "INR" },
        },

        capacity: Number,
        availableSlots: Number,
        slots: [{ type: mongoose.Schema.Types.ObjectId, ref: "ParkingSlot" }],
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        photos: [String],
    },
    { timestamps: true }
);

// ✅ Important: create Geo index for location
parkingSpaceSchema.index({ location: "2dsphere" });

const ParkingSpace = mongoose.model("ParkingSpace", parkingSpaceSchema);
export default ParkingSpace;