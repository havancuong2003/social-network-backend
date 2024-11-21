import express from "express";
import { upload } from "../utils/multer.js";
import { uploadMedia } from "../controllers/upload.controller.js";

const router = express.Router();

// Sửa key từ "images" thành "media" trong phương thức upload.array
router.post("/", upload.array("media", 10), uploadMedia);

export default router;
