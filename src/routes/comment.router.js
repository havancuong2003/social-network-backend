import express from "express";
import { getCommentsByPost } from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:postId", getCommentsByPost);

export default router;
