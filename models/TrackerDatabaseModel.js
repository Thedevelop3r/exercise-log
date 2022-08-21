const mongoose = require("mongoose");

// Log schema
const LogSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "please provide a description!"],
  },
  duration: {
    type: Number,
    required: [true, "please provide a duration of exercise!"],
  },
  date: {
    type: String,
    default: new Date().toDateString(),
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    required:[true, "please provide user id"]
  }
});

// userSchema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please provide a username!"],
  },
});

const LOG = mongoose.model("Logs", LogSchema);
const USER = mongoose.model("Users", UserSchema);

module.exports = { USER, LOG };
