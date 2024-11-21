import express from "express";
import { upload } from "../utils/multer.js";
import { uploadImages } from "../controllers/upload.controller.js";

const router = express.Router();

// Route upload nhiều file (key là 'images')
router.post("/", upload.array("images", 10), uploadImages);

export default router;
