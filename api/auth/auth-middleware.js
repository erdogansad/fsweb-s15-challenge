const { getByName } = require("../auth/auth-model");

const bodyController = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "username ve şifre gereklidir" });
  } else {
    next();
  }
};

const usernameExists = async (req, res, next) => {
  try {
    const rows = await getByName(req.body.username);
    if (!rows) {
      next();
    } else {
      res.status(409).json({ message: "username alınmış" });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { bodyController, usernameExists };
