import mongoose from "mongoose";
import dotenv from "dotenv";
import ParkingSpace from "../models/parkingSpaces.model.js";
import ParkingSlot from "../models/parkingSlot.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Handle ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from project root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

// 🗺️ Famous Kolkata locations
const locations = [
    {
        title: "Park Street City Center Parking",
        description: "Central parking near restaurants and nightlife at Park Street.",
        address: "Park Street, Kolkata, West Bengal",
        landmark: "Opposite Flurys Bakery",
        coordinates: { lat: 22.5522, lon: 88.3523 },
        hourlyRate: 40,
    },
    {
        title: "Salt Lake Sector V Tech Hub Parking",
        description: "Near IT offices, Infinity Benchmark, and Wipro campus.",
        address: "Sector V, Salt Lake, Kolkata",
        landmark: "Near RDB Boulevard",
        coordinates: { lat: 22.5791, lon: 88.4281 },
        hourlyRate: 35,
    },
    {
        title: "Howrah Station Parking Zone",
        description: "Dedicated parking for travelers near Howrah Junction.",
        address: "Howrah Station, Howrah, West Bengal",
        landmark: "Adjacent to Platform 1 entrance",
        coordinates: { lat: 22.585, lon: 88.3468 },
        hourlyRate: 50,
    },
    {
        title: "South City Mall Basement Parking",
        description: "Secure underground parking for mall visitors.",
        address: "Prince Anwar Shah Road, Kolkata",
        landmark: "Inside South City Mall",
        coordinates: { lat: 22.5015, lon: 88.3616 },
        hourlyRate: 45,
    },
    {
        title: "Eco Park North Gate Parking",
        description: "Spacious outdoor parking for Eco Park visitors.",
        address: "Action Area II, New Town, Kolkata",
        landmark: "North Gate near Coffee House",
        coordinates: { lat: 22.6193, lon: 88.4656 },
        hourlyRate: 30,
    },
];

async function seedData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🧹 Clean old data
        await ParkingSpace.deleteMany({});
        await ParkingSlot.deleteMany({});
        console.log("🧹 Cleared existing parking data");

        // 🔁 Loop through locations
        for (const loc of locations) {
            const parkingSpace = new ParkingSpace({
                ownerType: "platform",
                title: loc.title,
                description: loc.description,
                location: {
                    type: "Point", // ✅ GeoJSON format
                    coordinates: [loc.coordinates.lon, loc.coordinates.lat], // ✅ [longitude, latitude]
                    address: loc.address,
                    landmark: loc.landmark,
                },
                supportedVehicleTypes: ["car"],
                pricing: {
                    hourlyRate: loc.hourlyRate,
                    dailyRate: loc.hourlyRate * 8,
                    currency: "INR",
                },
                capacity: 0,
                availableSlots: 0,
                isVerified: true,
                hasSmartSensors: false,
                simulated: true,
            });

            await parkingSpace.save();
            console.log(`📍 Created space: ${parkingSpace.title}`);

            // create 5–7 slots
            const slotCount = Math.floor(Math.random() * 3) + 5;
            const slotDocs = [];

            for (let i = 1; i <= slotCount; i++) {
                const slot = await ParkingSlot.create({
                    slotNumber: `A${i}`,
                    vehicleType: "car",
                    status: "available",
                    simulated: true,
                });
                slotDocs.push(slot._id);
            }

            parkingSpace.slots = slotDocs;
            parkingSpace.capacity = slotCount;
            parkingSpace.availableSlots = slotCount;

            await parkingSpace.save();
            console.log(`🚗 Added ${slotCount} slots to "${loc.title}"`);
        }

        console.log("🎉 Parking spaces seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding data:", err);
        process.exit(1);
    }
}

seedData();