import User from "../models/user.model.js";
import Joi from "joi";

class UserController {

    async registerUser(req, res) {
        try {

            const schema = Joi.object({
                userId: Joi.string().required(),
                name: Joi.string().min(2).max(50).required(),
                email: Joi.string().email().required(),
                phone: Joi.string()
                    .pattern(/^[6-9]\d{9}$/)
                    .required()
                    .messages({ "string.pattern.base": "Invalid Indian phone number" }),
                password: Joi.string().min(4).required(),
                role: Joi.string().valid("driver", "host", "admin").default("driver"),
                plateNumber: Joi.string().optional(),
                vehicleType: Joi.string().valid("car", "bike").optional(),
                brand: Joi.string().optional(),
                homeLat: Joi.number().optional(),
                homeLon: Joi.number().optional(),
                homeLabel: Joi.string().optional(),
                officeLat: Joi.number().optional(),
                officeLon: Joi.number().optional(),
                officeLabel: Joi.string().optional(),
                maxPricePerHour: Joi.number().min(10).max(500).optional(),
            });

            const { error, value } = schema.validate(req.body, { abortEarly: false });
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.details.map((err) => err.message),
                });
            }

            // Log upload status: whether a file was received and basic non-secret metadata
            if (req.file) {
                console.log(
                    `[upload] file received for email=${value.email || req.body.email || 'unknown'} originalname=${req.file.originalname || 'n/a'} mime=${req.file.mimetype || 'n/a'} size=${req.file.size || 'n/a'} path=${req.file.path || 'n/a'}`
                );
            } else {
                console.log(`[upload] no file uploaded for email=${value.email || req.body.email || 'unknown'}`);
            }

            const existingUser = await User.findOne({ email: value.email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists" });
            }

            const user = new User({
                name: value.name,
                email: value.email,
                phone: value.phone,
                password: value.password,
                role: value.role,
                vehicle: {
                    plateNumber: value.plateNumber,
                    vehicleType: value.vehicleType,
                    vehiclePhoto: req.file?.path || "",
                    brand: value.brand,
                },
                preferences: {
                    homeLocation: { lat: value.homeLat, lon: value.homeLon, label: value.homeLabel },
                    officeLocation: { lat: value.officeLat, lon: value.officeLon, label: value.officeLabel },
                    maxPricePerHour: value.maxPricePerHour || 100,
                },
            });

            await user.save();

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user,
            });
        } catch (err) {
            console.error("Error registering user:", err);
            res.status(500).json({
                success: false,
                message: "Server error",
                error: err.message,
            });
        }
    }
}

const userController = new UserController();
export default userController;