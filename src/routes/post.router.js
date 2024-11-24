import express from "express";
import {
  createPost,
  getPost,
  getPosts,
} from "../controllers/post.controller.js";
import { authenticateUser } from "../middleware/authenticate.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.get("/", authenticateUser, getPosts);
router.post(
  "/uploadPost",
  authenticateUser,
  upload.array("media", 10),
  createPost
);

router.get("/:postId", authenticateUser, getPost);

export default router;
