import ParkingSpace from "../models/parkingSpaces.model.js";
import ParkingSlot from "../models/parkingSlot.model.js";
import Joi from "joi";

class ParkingController {
    async createParkingSpace(req, res) {
        try {
            // 1. Validate incoming data
            const schema = Joi.object({
                ownerId: Joi.string().optional(),
                title: Joi.string().required(),
                description: Joi.string().allow(""),
                address: Joi.string().required(),
                landmark: Joi.string().allow(""),
                lat: Joi.number().required(),
                lon: Joi.number().required(),
                hourlyRate: Joi.number().required(),
                dailyRate: Joi.number().optional(),
                supportedVehicleTypes: Joi.alternatives()
                    .try(
                        Joi.array().items(Joi.string().valid("car", "bike", "ev")),
                        Joi.string()
                    )
                    .default(["car"]),
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message,
                });
            }

            // 2. Normalize supported vehicle types
            const vehicleTypes =
                typeof value.supportedVehicleTypes === "string"
                    ? value.supportedVehicleTypes.split(",").map((v) => v.trim())
                    : value.supportedVehicleTypes;

            // 3. Handle uploaded photos (Cloudinary or Multer)
            const photoUrls = req.files?.map((file) => file.path) || [];

            // 4. Determine ownership type
            const isUserOwned = Boolean(value.ownerId);

            // 5. Create GeoJSON location object
            const location = {
                type: "Point",
                coordinates: [value.lon, value.lat], // GeoJSON = [longitude, latitude]
                address: value.address,
                landmark: value.landmark,
            };

            // 6. Create parking space
            const parkingSpace = await ParkingSpace.create({
                ownerType: isUserOwned ? "user" : "platform",
                owner: isUserOwned ? value.ownerId : null,
                title: value.title,
                description: value.description,
                location,
                supportedVehicleTypes: vehicleTypes,
                pricing: {
                    hourlyRate: value.hourlyRate,
                    dailyRate: value.dailyRate || value.hourlyRate * 8,
                    currency: "INR",
                },
                photos: photoUrls,
                capacity: 0,
                availableSlots: 0,
                isVerified: !isUserOwned,
            });

            // 7. Send success response
            return res.status(201).json({
                success: true,
                message: "Parking space created successfully",
                data: parkingSpace,
            });
        } catch (err) {
            console.error("Error creating parking space:", err);
            return res.status(500).json({
                success: false,
                message: "Server error while creating parking space",
                error: err.message,
            });
        }
    }

    async addParkingSlots(req, res) {
        try {

            const schema = Joi.object({
                spaceId: Joi.string().required(),
                slots: Joi.array()
                    .items(
                        Joi.object({
                            slotNumber: Joi.string().required(),
                            vehicleType: Joi.string().valid("car", "bike", "ev").default("car"),
                            pricePerHour: Joi.number().optional(),
                        })
                    )
                    .min(1)
                    .required(),
            });

            const { spaceId, slots } = await schema.validateAsync(req.body);

            const space = await ParkingSpace.findById(spaceId);
            if (!space) {
                return res.status(404).json({
                    success: false,
                    message: "Parking space not found",
                });
            }


            const createdSlots = [];
            for (const s of slots) {
                const slot = await ParkingSlot.create({
                    parkingSpace: spaceId,
                    slotNumber: s.slotNumber,
                    vehicleType: s.vehicleType,
                    pricePerHour: s.pricePerHour || space.pricing.hourlyRate, // fallback to space-level price
                });

                space.slots.push(slot._id);
                createdSlots.push(slot);
            }


            space.capacity += createdSlots.length;
            space.availableSlots += createdSlots.length;

            await space.save();

            res.status(201).json({
                success: true,
                message: `${createdSlots.length} slots added successfully`,
                data: createdSlots,
            });
        } catch (error) {
            console.error("Error adding slots:", error);

            if (error.isJoi)
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message,
                });

            res.status(500).json({
                success: false,
                message: "Server error while adding slots",
                error: error.message,
            });
        }
    };

    async getNearByParking(req, res) {
        try {
            const { lat, lon, maxDistance = 2000 } = req.query;

            if (!lat || !lon) {
                return res.status(400).json({
                    success: false,
                    message: "Latitude and longitude are required",
                });
            }

            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            // Step 1: Find nearby parking spaces using GeoJSON
            const nearbySpaces = await ParkingSpace.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [longitude, latitude] }, // [lon, lat]
                        distanceField: "distance",
                        spherical: true,
                        maxDistance: parseFloat(maxDistance),
                    },
                },
                {
                    $match: { availableSlots: { $gt: 0 } }, // only spaces with free slots
                },
                {
                    $lookup: {
                        from: "parkingslots", // collection name in lowercase
                        localField: "slots",
                        foreignField: "_id",
                        as: "slotDetails",
                    },
                },
                {
                    $addFields: {
                        slotDetails: {
                            $filter: {
                                input: "$slotDetails",
                                as: "slot",
                                cond: { $eq: ["$$slot.status", "available"] }, // only available slots
                            },
                        },
                    },
                },
                {
                    $project: {
                        title: 1,
                        description: 1,
                        "location.address": 1,
                        "location.landmark": 1,
                        "location.coordinates": 1,
                        pricing: 1,
                        supportedVehicleTypes: 1,
                        availableSlots: 1,
                        capacity: 1,
                        distance: 1,
                        slotDetails: {
                            slotNumber: 1,
                            vehicleType: 1,
                            pricePerHour: 1,
                            status: 1,
                        },
                    },
                },
                { $sort: { distance: 1 } },
                { $limit: 10 },
            ]);

            if (!nearbySpaces.length) {
                return res.status(404).json({
                    success: false,
                    message: "No nearby parking spaces found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Nearby parking spaces found",
                count: nearbySpaces.length,
                data: nearbySpaces,
            });
        } catch (error) {
            console.error("Error finding nearby parking spaces:", error);
            res.status(500).json({
                success: false,
                message: "Server error while fetching nearby parking spaces",
                error: error.message,
            });
        }
    }

}

const parkingController = new ParkingController();
export default parkingController;