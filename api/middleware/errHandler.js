module.exports = (err, req, res, next) => {
  res.headersSent ? next(err) : res.status(err.status || 500).json({ message: err.message || "internal server error." });
};
