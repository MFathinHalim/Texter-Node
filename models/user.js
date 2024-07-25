"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.userModel = void 0;
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
  id: String,
  name: String,
  username: String,
  desc: String,
  password: String,
  pp: String,
  ban: Boolean,
  followers: [{ type: mongoose_1.Types.ObjectId, ref: "user" }],
  following: [{ type: mongoose_1.Types.ObjectId, ref: "user" }],
});
var userModel = (0, mongoose_1.model)("user", userSchema);
module.exports = { userModel, userSchema };
