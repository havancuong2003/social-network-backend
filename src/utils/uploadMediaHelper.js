import fs from "fs";
import cloudinary from "./cloudinaryConfig.js";
export const uploadMedia = async (files) => {
  try {
    const urls = [];

    // Duyệt qua tất cả các file trong req.files và upload lên Cloudinary
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "uploads", // Thư mục upload
        resource_type: file.mimetype.startsWith("video") ? "video" : "image", // Kiểm tra loại tệp
      });

      urls.push(result.secure_url); // Lưu URL của file đã upload
      fs.unlinkSync(file.path); // Xóa file tạm sau khi upload
    }

    return {
      message: "Files uploaded successfully",
      urls,
    };
  } catch (error) {
    res.status(500).json({
      error: "Failed to upload files",
      details: error.message,
    });
  }
};