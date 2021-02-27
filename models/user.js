const { model, Schema } = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const { SALT } = require("../utils/constants");
const { ObjectId } = Schema.Types;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid Email."],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  posts: [{
      type: ObjectId,
      ref: "Post",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", function (next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(SALT, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function (attemptedPassword) {
  return await bcrypt.compare(attemptedPassword, this.password);
};

module.exports = model("User", userSchema);
