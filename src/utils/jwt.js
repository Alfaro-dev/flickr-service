const { hash, verify } = require("argon2")
const jwt = require("jsonwebtoken")
require("dotenv").config();

const hashPassword = async (password) => {
  return await hash(password);
};

const signToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET);
}

const verifyPassword = async (hash, password) => {
  return await verify(hash, password);
}

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken
};