import express from "express";
import { login, signup, logout } from "../controllers/auth.controller.js";

const route = express.Router();

route.post("/login", login);

route.post("/signup", signup);

route.get("/logout", logout);

export default route;
