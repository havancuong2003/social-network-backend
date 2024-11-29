import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getPostByPostId } from "./post.controller.js";

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserInfo controller", error);
    res.status(500).send("Internal server error");
  }
};

export const getMediaUser = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ tham số đường dẫn
    const { limit = 30, page = 1 } = req.query; // Lấy limit và page từ tham số query (mặc định limit 30, page 1)

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Tính toán số lượng bài viết cần bỏ qua để phân trang
    const skip = (page - 1) * limit;

    // Lấy tất cả bài viết có media hoặc content (chứa nội dung hoặc có media)
    const posts = await Post.find({
      author: userId,
      $or: [
        { media: { $exists: true, $not: { $size: 0 } } },
        { content: { $exists: true, $ne: "" } },
      ],
    })
      .skip(skip) // Bỏ qua số lượng bài viết đã qua
      .limit(Number(limit)); // Giới hạn số lượng bài viết trả về

    let mediaResults = [];

    // Lấy media từ bài viết
    for (const post of posts) {
      // Kiểm tra nếu bài viết có media và lấy media từ bài viết
      if (post.media.length > 0) {
        mediaResults.push({
          post: post,
          mediaShow: post.media, // Lấy tất cả media của bài viết
        });

        // Nếu tổng số media đã đạt tới limit, dừng lại
        if (mediaResults.length * post.media.length >= limit) break;
      }
    }

    // Nếu tổng số media ít hơn limit, tìm thêm các bài viết khác cho đủ
    const remainingLimit = limit - mediaResults.length;
    if (remainingLimit > 0) {
      const additionalPosts = await Post.find({ author: userId })
        .skip(skip + mediaResults.length) // Đảm bảo là tìm các bài sau bài viết đầu tiên
        .limit(remainingLimit);

      // Lấy media từ các bài viết thêm vào
      for (const post of additionalPosts) {
        if (post.media.length > 0) {
          mediaResults.push({
            post: post,
            mediaShow: post.media,
          });
        }
      }
    }

    // Trả về dữ liệu
    res.status(200).json(mediaResults);
  } catch (error) {
    console.log("Error in getMediaUser controller", error);
    res.status(500).send("Internal server error");
  }
};
