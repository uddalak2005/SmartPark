import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            match: [/^[6-9]\d{9}$/, "Please enter a valid phone number"],
        },

        password: {
            type: String,
            required: true,
            minlength: 4, // keep it short for hackathon testing
        },

        role: {
            type: String,
            enum: ["driver", "host", "admin"],
            default: "driver",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        // vehicle details for driver
        vehicle: {
            plateNumber: { type: String, trim: true, uppercase: true },
            vehicleType: { type: String, enum: ["car", "bike"], default: "car" },
            vehiclePhoto: { type: String },
            isVehicleVerified: { type: Boolean, default: false },
            brand: { type: String, trim: true },
        },

        // basic preferences
        preferences: {
            homeLocation: {
                lat: Number,
                lon: Number,
                label: String,
            },
            officeLocation: {
                lat: Number,
                lon: Number,
                label: String,
            },
            maxPricePerHour: {
                type: Number,
                default: 100,
            },
            notificationsEnabled: {
                type: Boolean,
                default: true,
            },
        },

        rewardPoints: {
            type: Number,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLoginAt: Date,
        onboardingCompletedAt: Date,
    },
    {
        timestamps: true,
    }
);

// index for fast search
userSchema.index({ email: 1, phone: 1 });

const User = mongoose.model("User", userSchema);

export default User;
