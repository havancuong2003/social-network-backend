import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    biography: {
      type: String,
      default: "",
    },
    coverPic: {
      type: String,
      default:
        "https://res.cloudinary.com/ddvt5srdy/image/upload/v1732677787/images_k5vtyz.jpg",
    },
    birthday: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: "",
    },
    relationship: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    work: {
      type: String,
      default: "",
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
