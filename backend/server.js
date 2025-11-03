import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables before importing app or any modules that rely on them
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
    try {
        const { default: app } = await import("./src/app.js");

        await mongoose.connect(MONGO_URI);
        console.log("Connected to Mongo DB");

        app.listen(PORT, () => {
            console.log(`app is listening on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();