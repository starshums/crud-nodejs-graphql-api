const { ApolloError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { SECRET } = require("./constants");

module.exports = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token.");
      }
    }
    throw new ApolloError("Invalid token.");
  }
  throw new ApolloError("Authorization header must be provided.");
};
