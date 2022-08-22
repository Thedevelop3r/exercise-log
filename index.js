const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Logger = require("./controller/logger");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { USER, LOG } = require("./models/tracker");
// --- Setting Up PORT && MONGOOSE CONFIG --- //
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;
app.use(Logger);
~app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(`${process.cwd()}/public`));

// --- Middlewares --- //
// --- database connection --- //
async function ConnectDB() {
  return await mongoose.connect(MONGO_URI, {
    dbName: "db",
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 5000,
  });
}

const connection = mongoose.connection;
connection.on("error", (error) => {
  console.log(error);
});
connection.on("connecting", (data) => {
  console.log("Connecting to mongoose database......");
});
connection.on("open", (data) => {
  console.log("Connection to mongoose database established successfully.");
});
// --- Home Route Api * Index.html File --- //
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

// --- Get All Users * Array Result --- //
app.get("/api/users", async (req, res) => {
  const users = await USER.find().select("-__v");
  res.json(users);
});
// --- Create New User Route Api --- //
app.post("/api/users", async (req, res) => {
  const data = req.body;
  const username = data?.username;
  // --- Username Nan? --- //
  if (!username) {
    console.log("Username not provided");
    return res.json({
      error: "Username must be provided!",
    });
  }
  // --- New User Creation --- //
  console.log("user: " + username + " requested admission.");
  // --- New User Options --- //
  const _user = new USER({
    username: username,
  });
  // --- New User Created --- //
  await _user.save();
  console.log(_user);
  res.json({
    username: _user.username,
    _id: _user._id,
  });
});
// --- User Excercise Create | Post Data | --- //
/*The response returned from 
POST /api/users/:_id/exercises will be the
 user object with the exercise fields added. */
app.post("/api/users/:_id/exercises", async (req, res) => {
  console.log(req.body);
  // --- User id To Insert Data--- //
  const data = req.body;
  const { _id } = req.params;
  const description = data?.description;
  const duration = data?.duration;
  const date = data?.date;
  if (!_id) {
    return res.send("please provide user id");
  }
  if (!description || !duration) {
    return res.send("please provide description and duration");
  }

  let _userLog = new LOG({
    description: description,
    duration: Number(duration),
  });

  if (!date) {
    _userLog.date = new Date().toISOString().substring(0, 10);
  }else{
    _userLog.date = date;
  }

  // --- User Validation --- //
  let userfound = await USER.findByIdAndUpdate(_id, {$push:{
    log:_userLog
  }},{new:true});
  if (!userfound) {
    // --- No User Found --- //
    console.log(`No User Found! with id:${_id}`);
    return res.send("No user found!");
  }
  await userfound.save();
  res.json({
    "_id" : userfound._id,
    "username" : userfound.username,
    "date": new Date(_userLog.date).toDateString(),
    "description" : _userLog.description,
    "duration" : _userLog.duration
  });
});

// --- Get User All Excercise Logs || Route Api --- //
app.get("/api/users/:_id/logs", async (req, res) => {
  // --- Get User ID From req.params (:_id) --- //
  const { _id } = req.params;
  console.log(_id);
  let _user = await USER.findById(_id);
  if (!_user) {
    console.log("No User Found!");
    return res.send("No User Found");
  }

  _user.log.forEach(record=>{
    record.date = new Date(record.date).toDateString();
  });

  res.json({
    username: _user.username,
    count: _user.log.length,
    _id: _user._id,
    log: _user.log
  });




  // let _userLogs = await LOG.find({ createdBy: _user._id })
  //   .select("-createdBy")
  //   .select("-__v")
  //   .select("-_id");
  // // --- Setting Up User Date --- //
  // _userLogs.forEach((element) => {
  //   element.date = String(element.date);
  // });

  // --- Generating Response --- //
  // let _response = {
  //   username: _user.username,
  //   _id: _user._id,
  //   count: _userLogs.length,
  //   log: _userLogs,
  // };

  // res.json(_response);
});

// --- Server Starts Here --- //

async function START_SERVER() {
  await ConnectDB();
  // --- Server Listening --- //
  const listener = await app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
}
//--- Starting Server && Mongoo Connection --- //
START_SERVER();
