const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  avatar: { type: String, default: "" },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  linkedin: {type: String, default: ""},
  github: {type: String, default: ""},
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("UserModel", UserSchema);

module.exports = UserModel;