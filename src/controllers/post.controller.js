import Post from "../models/post.model.js";
import { uploadMedia } from "../utils/uploadMediaHelper.js";
import Comment from "../models/comment.model.js";

export const getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params, mặc định là page 1 và limit 10

  try {
    // Tính toán offset để phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách bài viết với phân trang và populate thông tin về tác giả và bình luận
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
      .skip(skip) // Bỏ qua số lượng bài viết từ trước đó
      .limit(limit) // Giới hạn số lượng bài viết trả về
      .populate([
        {
          path: "author", // Populate thông tin tác giả
          select: "fullName userName email profilePic", // Chọn các trường cần thiết
        },
        {
          path: "comments", // Populate danh sách bình luận
          select: "user content createdAt", // Chọn trường user và content từ Comment schema
          populate: {
            path: "user", // Populate user trong mỗi bình luận
            select: "userName profilePic", // Chọn các trường cần thiết từ user
          },
        },
      ]);

    // Dùng .map() để xử lý mỗi bài viết sau khi populate
    const populatedPosts = posts.map((post) => {
      const leanPost = post.toObject(); // Chuyển đổi mỗi post thành object thuần

      // Cập nhật thông tin tác giả
      leanPost.author.userId = leanPost.author._id;
      leanPost.author.name = leanPost.author.fullName;
      leanPost.author.avatar = leanPost.author.profilePic;
      leanPost.date = leanPost.createdAt.toDateString();
      leanPost.postId = leanPost._id;

      // Xóa các trường không cần thiết
      delete leanPost.author.profilePic;
      delete leanPost.author.fullName;
      delete leanPost.author._id;
      delete leanPost.createdAt;
      delete leanPost._id;

      // Tính số lượng like (sử dụng trường `tymedBy` của bạn)
      const numberLike = leanPost.tymedBy ? leanPost.tymedBy.length : 0;

      // Format the comments for each post
      const formattedComments = leanPost.comments.map((comment) => {
        return {
          _id: comment._id.toString(),
          userId: comment.user._id.toString(),
          userName: comment.user.userName,
          userAvatar: comment.user.profilePic,
          text: comment.content, // Nội dung bình luận
          date: comment.createdAt.toDateString(), // Format ngày của bình luận
        };
      });

      // Thêm các bình luận đã format vào bài viết
      leanPost.comments = formattedComments;

      // Trả về kết quả với trường likes
      return { ...leanPost, likes: numberLike };
    });

    // Trả về dữ liệu với các bài viết đã phân trang
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

export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "author", // Populate the author of the post
          select: "fullName userName email profilePic", // Select the necessary fields for the post author
        },
        {
          path: "comments", // Populate the comments
          select: "user content createdAt", // Select the necessary fields from the comment
          populate: {
            path: "user", // Populate the user inside each comment
            select: "userName profilePic", // Select the fields you need from the user
          },
        },
      ]);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Process the post data
    const leanPost = post.toObject();

    // Format the post data (author)
    leanPost.author.userId = leanPost.author._id;
    leanPost.author.name = leanPost.author.fullName;
    leanPost.author.avatar = leanPost.author.profilePic;
    leanPost.date = leanPost.createdAt.toDateString();
    leanPost.postId = leanPost._id;

    // Remove unnecessary fields
    delete leanPost.author.profilePic;
    delete leanPost.author.fullName;
    delete leanPost.author._id;
    delete leanPost.createdAt;

    // Format the comments data
    const formattedComments = leanPost.comments.map((comment) => {
      return {
        _id: comment._id.toString(),
        userId: comment.user._id.toString(),
        userName: comment.user.userName,
        userAvatar: comment.user.profilePic,
        text: comment.content,
        date: comment.createdAt.toDateString(),
      };
    });

    // Add the formatted comments to the post data
    leanPost.comments = formattedComments;

    // Tính số lượng like (sử dụng trường `tymedBy` của bạn)
    const numberLike = leanPost.tymedBy ? leanPost.tymedBy.length : 0;

    // Respond with the populated post data including the formatted comments
    res.status(200).json({
      ...leanPost,
      likes: numberLike,
    });
  } catch (error) {
    console.log("Error in getPosts controller", error);
    res.status(500).send("Internal server error");
  }
};

export const tymPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (post.tymedBy.includes(userId)) {
      post.tymedBy = post.tymedBy.filter((id) => id !== userId);
    } else {
      post.tymedBy.push(userId);
    }

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in tymPost controller", error);
    res.status(500).send("Internal server error");
  }
};

export const changeReact = async (req, res) => {
  try {
    const data = req.body;
    const post = await Post.findById(data.postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Kiểm tra xem userId có trong tymedBy không
    const userId = req.user.id;

    if (post.tymedBy.includes(userId)) {
      // Nếu có, bỏ tym
      post.tymedBy = post.tymedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      console.log("hi");
    } else {
      console.log("i am here");

      // Nếu không có, thêm tym
      post.tymedBy.push(userId);
    }

    // Lưu thay đổi vào cơ sở dữ liệu
    await post.save();
    console.log("check", post.tymedBy);

    // Trả về post sau khi cập nhật
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in changeReact controller", error);
    res.status(500).send("Internal server error");
  }
};

export const getPostsByUser = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params, mặc định là page 1 và limit 10
  const { userId } = req.params;

  try {
    // Tính toán offset để phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách bài viết với phân trang và populate thông tin về tác giả và bình luận
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
      .skip(skip) // Bỏ qua số lượng bài viết từ trước đó
      .limit(limit) // Giới hạn số lượng bài viết trả về
      .populate([
        {
          path: "author", // Populate thông tin tác giả
          select: "fullName userName email profilePic", // Chọn các trường cần thiết
        },
        {
          path: "comments", // Populate danh sách bình luận
          select: "user content createdAt", // Chọn trường user và content từ Comment schema
          populate: {
            path: "user", // Populate user trong mỗi bình luận
            select: "userName profilePic", // Chọn các trường cần thiết từ user
          },
        },
      ]);

    // Dùng .map() để xử lý mỗi bài viết sau khi populate
    const populatedPosts = posts.map((post) => {
      const leanPost = post.toObject(); // Chuyển đổi mỗi post thành object thuần

      // Cập nhật thông tin tác giả
      leanPost.author.userId = leanPost.author._id;
      leanPost.author.name = leanPost.author.fullName;
      leanPost.author.avatar = leanPost.author.profilePic;
      leanPost.date = leanPost.createdAt.toDateString();
      leanPost.postId = leanPost._id;

      // Xóa các trường không cần thiết
      delete leanPost.author.profilePic;
      delete leanPost.author.fullName;
      delete leanPost.author._id;
      delete leanPost.createdAt;
      delete leanPost._id;

      // Tính số lượng like (sử dụng trường `tymedBy` của bạn)
      const numberLike = leanPost.tymedBy ? leanPost.tymedBy.length : 0;

      // Format the comments for each post
      const formattedComments = leanPost.comments.map((comment) => {
        return {
          _id: comment._id.toString(),
          userId: comment.user._id.toString(),
          userName: comment.user.userName,
          userAvatar: comment.user.profilePic,
          text: comment.content, // Nội dung bình luận
          date: comment.createdAt.toDateString(), // Format ngày của bình luận
        };
      });

      // Thêm các bình luận đã format vào bài viết
      leanPost.comments = formattedComments;

      // Trả về kết quả với trường likes
      return { ...leanPost, likes: numberLike };
    });

    // Trả về dữ liệu với các bài viết đã phân trang
    res.status(200).json(populatedPosts);
  } catch (error) {
    console.log("Error in getPosts controller", error);
    res.status(500).send("Internal server error");
  }
};
