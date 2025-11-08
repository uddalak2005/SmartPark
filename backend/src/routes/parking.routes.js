import parkingController from "../controllers/parking.controller.js";
import express from "express";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/create", upload.array("photos", 5), parkingController.createParkingSpace);
router.post("/addSlot", parkingController.addParkingSlots);
router.get("/getNearby", parkingController.getNearByParking);


export default router;
