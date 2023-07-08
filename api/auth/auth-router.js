const router = require("express").Router();
const { bodyController, usernameExists } = require("./auth-middleware.js");
const { create, getByName } = require("./auth-model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/secret.js");

router.post("/register", bodyController, usernameExists, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 8);
    const user = await create({ username, password: hash });
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
});

router.post("/login", bodyController, async (req, res, next) => {
  try {
    const { username, password } = req.body,
      query = await getByName(username),
      compare = query ? await bcrypt.compare(password, query.password) : false,
      token = query ? jwt.sign({ id: query.id, username: query.username }, JWT_SECRET, { expiresIn: "3h" }) : null;
    if (query && compare) {
      res.json({
        message: `welcome, ${username}`,
        token: token,
      });
    } else {
      res.status(401).json({ message: "geçersiz kriterler" });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
