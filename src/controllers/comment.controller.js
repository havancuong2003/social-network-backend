import mongoose from "mongoose";

export const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    // Nếu `postId` không hợp lệ
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId format" });
    }

    // Tìm bình luận với `postId` đã chuyển thành `ObjectId`
    const comments = await Comment.find({
      postId: mongoose.Types.ObjectId(postId),
    });

    // Nếu không tìm thấy bình luận
    if (comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this post" });
    }

    // Trả về danh sách bình luận
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getCommentsByPost controller", error);
    res.status(500).send("Internal server error");
  }
};
