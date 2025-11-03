import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.config.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "SmartPark/vehicles",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
});

const upload = multer({ storage });

export default upload;