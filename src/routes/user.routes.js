import express from "express";
import { getMediaUser, getUserInfo } from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/authenticate.js";

const route = express.Router();

route.get("/:userId", authenticateUser, getUserInfo);
route.get("/media/:userId", authenticateUser, getMediaUser);
export default route;
