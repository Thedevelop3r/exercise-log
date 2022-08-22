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
  },
});

// userSchema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please provide a username!"],
  },
  log:[LogSchema],
});


const LOG = mongoose.model("Logs", LogSchema);
const USER = mongoose.model("Users", UserSchema);

module.exports = { USER, LOG };
