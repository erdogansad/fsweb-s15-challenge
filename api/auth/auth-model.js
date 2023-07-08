const db = require("../../data/dbConfig");

const create = async (user) => {
  let query = await db("users").insert(user).returning("*");
  return query[0];
};

const getByName = (username) => {
  return db("users").where({ username }).first();
};

module.exports = {
  create,
  getByName,
};
