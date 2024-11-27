import express from "express";
import {
  createComment,
  getCommentsByPost,
} from "../controllers/comment.controller.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/:postId", authenticateUser, getCommentsByPost);
router.post("/addComment", authenticateUser, createComment);
export default router;
