import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.jwt; // Lấy token từ cookie

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication failed: No token provided." });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Dùng cùng SECRET_KEY khi tạo token
    req.user = decoded; // Thêm thông tin user vào req để sử dụng ở các route tiếp theo
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ message: "Authentication failed: Invalid token." });
  }
};
