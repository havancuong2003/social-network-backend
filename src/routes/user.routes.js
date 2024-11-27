import express from "express";
import { getUserInfo } from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/authenticate.js";

const route = express.Router();

route.get("/:userId", authenticateUser, getUserInfo);
export default route;
