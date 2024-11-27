import User from "../models/user.model.js";

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserInfo controller", error);
    res.status(500).send("Internal server error");
  }
};
