import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import parkingRoutes from "./routes/parking.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";

const app = express();

app.use(cors({
    origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.status(200).send("SmartPark Backend");
})

app.use("/user", userRoutes);
app.use("/parking", parkingRoutes);
app.use("/booking", bookingRoutes);
app.use("/payments", paymentsRoutes);

export default app;