import http from "http";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import { connectToMongoDb } from "./db/connectToMongoDb.js";
import cookieParser from "cookie-parser";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Cho phép domain frontend của bạn (với port 5173)
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức được phép
    allowedHeaders: ["Content-Type", "Authorization"], // Các header được phép
    credentials: true, // Cho phép gửi cookie (JWT) từ frontend
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/test", (req, res) => {
  console.log("adasdasd");
  res.send("Test successful");
});

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  connectToMongoDb();
  console.log("Running at port 5000");
});
