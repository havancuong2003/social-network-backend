import mongoose from "mongoose";
export const connectToMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("connected to mongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};
