import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    }, // Tham chiếu tới bài viết
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Người bình luận
    content: { type: String, required: true }, // Nội dung bình luận
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);
const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
