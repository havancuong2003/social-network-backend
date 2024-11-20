import http from "http";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors({ origin: ["/*"] }));
app.use(express.json());

app.get("/test", () => {
  console.log("adasdasd");
});

app.listen("5000", () => {
  console.log("running at port 5000");
});
