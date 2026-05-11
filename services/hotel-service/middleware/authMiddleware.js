const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }
  } else {
    return res.status(401).json({
      message: "No Token",
    });
  }
};

const hotelOnly = async (req, res, next) => {
  if (req.user.role !== "hotel") {
    return res.status(403).json({
      message: "Hotel Access Only",
    });
  }

  next();
};

module.exports = {
  protect,
  hotelOnly,
};
