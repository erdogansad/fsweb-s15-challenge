const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./secret.js");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const jwtToken = token.split(" ")[1];
    jwt.verify(jwtToken, JWT_SECRET, (err, decoded) => {
      if (decoded) {
        req.decodedJwt = decoded;
        next();
      } else {
        res.status(401).json({ message: "token geçersizdir" });
      }
    });
  } else {
    res.status(400).json({ message: "token gereklidir" });
  }
};
