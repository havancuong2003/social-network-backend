import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

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

export const createComment = async (req, res) => {
  const data = req.body;
  console.log("data", data, req.user);

  try {
    const postId = data.postId;
    const userId = req.user.id;
    const content = data.text;

    // Create the new comment
    const newComment = new Comment({
      post: postId,
      user: userId,
      content: content,
    });

    // Save the comment to the database
    await newComment.save();

    // Find the post by postId and add the comment's ID to the comments array
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    post.comments.push(newComment._id);
    await post.save();

    // Respond with the created comment
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error in createComment controller", error);
    res.status(500).send("Internal server error");
  }
};
