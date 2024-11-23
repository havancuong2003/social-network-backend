import Post from "../models/post.model.js";
import { uploadMedia } from "../utils/uploadMediaHelper.js";
import Comment from "../models/comment.model.js";

export const getPosts = async (req, res) => {
  try {
    // Lấy danh sách các bài viết và populate thông tin về tác giả và bình luận
    const posts = await Post.find().populate([
      {
        path: "author", // Populate thông tin tác giả
        select: "fullName userName email profilePic", // Chọn các trường cần thiết
      },
      {
        path: "comments", // Populate danh sách bình luận
        select: "userId userName text userAvatar createdAt",
      },
    ]);

    // Dùng .map() để xử lý mỗi bài viết sau khi populate
    const populatedPosts = posts.map((post) => {
      // Chuyển đổi mỗi post thành object thuần
      const leanPost = post.toObject();

      // Cập nhật thông tin tác giả
      leanPost.author.userId = leanPost.author._id;
      leanPost.author.name = leanPost.author.fullName;
      leanPost.author.avatar = leanPost.author.profilePic;

      // Xóa các trường không cần thiết
      delete leanPost.author.profilePic;
      delete leanPost.author.fullName;
      delete leanPost.author._id;

      // Tính số lượng like (sử dụng trường `tymedBy` của bạn)
      const numberLike = leanPost.tymedBy ? leanPost.tymedBy.length : 0;

      // Trả về kết quả với trường likes
      return { ...leanPost, likes: numberLike };
    });

    // Trả về dữ liệu cho người dùng
    res.status(200).json(populatedPosts);
  } catch (error) {
    console.log("Error in getPosts controller", error);
    res.status(500).send("Internal server error");
  }
};

export const createPost = async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;
    const content = data.text;

    const userId = req.user.id;
    const responseAfterUpload = await uploadMedia(files);

    const post = await Post.create({
      author: userId,
      content,
      media: responseAfterUpload.urls.map((url) => url),
    });

    await post.save();
    const populatedPost = await post.populate([
      {
        path: "author", // Populate thông tin người viết bài
        select: "fullName userName email profilePic", // Chọn các trường cần thiết
      },
      {
        path: "comments", // Populate danh sách bình luận
        select: "userId userName text userAvatar createdAt",
      },
    ]);

    // Sau khi populate xong, sử dụng .lean() để chuyển thành object thuần
    const leanPost = populatedPost.toObject(); // Chuyển đổi thành plain object

    // Thay đổi _id thành userId cho author
    leanPost.author.userId = leanPost.author._id;
    leanPost.author.name = leanPost.author.fullName;
    leanPost.author.avatar = leanPost.author.profilePic;

    delete leanPost.author.profilePic;
    delete leanPost.author.fullName;
    delete leanPost.author._id;

    const numberLike = populatedPost.tymedBy.length;

    // Trả về kết quả, bao gồm trường numberLike
    res.status(200).json({ ...leanPost, likes: numberLike });
  } catch (error) {
    console.log("Error in createPost controller", error);
    res.status(500).send("Internal server error");
  }
};
