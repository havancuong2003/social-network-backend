import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName });

    if (user && (await bcrypt.compare(password, user.password))) {
      generateToken(user._id, res);
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        profilePic: user.profilePic,
      });
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).send("Internal server error");
  }
};

export const signup = async (req, res) => {
  try {
    const { email, fullName, userName, password, confirmPassword, gender } =
      req.body;
    if (password !== confirmPassword) {
      res.status(400).send("Password and confirm password do not match");
      return;
    }

    const user = await User.findOne({ userName });
    if (user) {
      res.status(400).send("User already exists");
      return;
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const boyPic = `https://avatar.iran.liara.run/public/boy`;
    const girlPic = `https://avatar.iran.liara.run/public/girl`;

    const newUser = new User({
      email,
      fullName,
      userName,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyPic : girlPic,
    });
    if (newUser) {
      // generate token here

      generateToken(newUser._id, res);

      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.log("Error in sigunup controller", error);
    res.status(500).send("Internal server error");
  }
};

export const logout = (req, res) => {
  // remove cookie
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};
