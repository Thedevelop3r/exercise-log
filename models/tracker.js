const mongoose = require("mongoose");
// Log schema || is a userSchema Child 
const LogSchema = new mongoose.Schema({
  // 2 properties are required
  description: {
    type: String,
    required: [true, "please provide a description!"],
  },
  duration: {
    type: Number,
    required: [true, "please provide a duration of exercise!"],
  },
  // if date isnt provided server sets up the date to current date : toDateString()
  date: {
    type: String,
  },
});
// userSchema || Parent Schema || uses LogSchema to store exercises
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please provide a username!"],
  },
  // uses $push option to push into this array
  log:[LogSchema],
});
const LOG = mongoose.model("Logs", LogSchema); // Log model for Parent schema
const USER = mongoose.model("Users", UserSchema); // User model is Parent schema
module.exports = { USER, LOG }; // exporting schema to index.js file
