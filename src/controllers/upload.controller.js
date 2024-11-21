import fs from "fs";
import cloudinary from "../utils/cloudinaryConfig.js";

export const uploadImages = async (req, res) => {
  try {
    const urls = [];

    // Upload từng file lên Cloudinary
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "uploads",
      });
      urls.push(result.secure_url); // Lưu URL của từng file
      fs.unlinkSync(file.path); // Xóa file tạm
    }

    res.status(200).json({
      message: "Images uploaded successfully",
      urls,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to upload images",
      details: error.message,
    });
  }
};
