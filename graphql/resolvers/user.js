const { ApolloError, UserInputError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const { SECRET } = require("../../utils/constants");

module.exports = {
  User: {
    posts: async (parent) => {
      return (await parent.populate("posts").execPopulate()).posts;
    },
  },
  Query: {
    async users(_, args, { db }) {
      try {
        const users = await db.User.find().sort({ createdAt: -1 });
        return users;
      } catch (err) {
        throw new ApolloError(err);
      }
    },
    async me(_, args, { db, user: loggedInUser }) {
      const user = await db.User.findById(loggedInUser.id);
      return user;
    },
  },
  Mutation: {
    async login(_, { loginInput: { email, password } }, { db }) {
      const errors = {};
      if (validator.isEmpty(email)) {
        errors.username = "Email must not be empty.";
        throw new UserInputError("Errors", { errors });
      } else if (!validator.isEmail(email)) {
        errors.email = "Invalid email.";
        throw new UserInputError("Errors", { errors });
      }
      if (validator.isEmpty(password)) {
        errors.password = "Password must not be empty.";
        throw new UserInputError("Errors", { errors });
      }

      const user = await db.User.findOne({ email });
      if (!user) {
        errors.invalidEmail = "Incorrect credentials.";
        throw new UserInputError("Errors", { errors });
      }
      const checkPassword = await user.comparePassword(password);
      if (!checkPassword) {
        errors.invalidpassword = "Incorrect credentials.";
        throw new UserInputError("Errors", { errors });
      }

      const token = await jwt.sign(
        {
          id: user._id,
          username: user.username,
        },
        SECRET,
        { expiresIn: "1d" }
      );

      return {
        ...user._doc,
        id: user.id,
        token,
      };
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } },
      { db }
    ) {
      const errors = {};
      if (validator.isEmpty(username)) {
        errors.username = "Username must not be empty.";
        throw new UserInputError("Errors", { errors });
      }
      if (validator.isEmpty(email)) {
        errors.email = "Email must not be empty.";
        throw new UserInputError("Errors", { errors });
      } else if (!validator.isEmail(email)) {
        errors.email = "Invalid email.";
        throw new UserInputError("Errors", { errors });
      }
      if (validator.isEmpty(password)) {
        errors.password = "Password must not be empty.";
        throw new UserInputError("Errors", { errors });
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords must match";
        throw new UserInputError("Errors", { errors });
      }

      const checkUser = await db.User.findOne({ username });
      if (checkUser) {
        errors.user = "Username is taken.";
        throw new UserInputError("Errors", { errors });
      }

      const newUser = await new db.User({
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const user = await newUser.save();
      const token = await jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        SECRET,
        { expiresIn: "1d" }
      );

      return {
        ...user._doc,
        id: user.id,
        token,
      };
    },
  },
};
