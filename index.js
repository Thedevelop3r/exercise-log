const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Logger = require("./controller/logger");
const cors = require("cors");
require("dotenv").config();
const { USER, LOG } = require("./models/tracker");
// --- Setting Up PORT && MONGOOSE CONFIG --- //
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;
const app = express();
app.use(Logger);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(`${process.cwd()}/public`));

// --- Middlewares --- //
// --- database connection --- //
// --- MONGO_URI came from process.env.MONGOURI --- //

async function ConnectDB() {
  return await mongoose.connect(MONGO_URI, {
    dbName: "db",
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 5000,
  });
}
// --- Mongoose Connection Events Listning --- //
const connection = mongoose.connection;
connection.on("error", (error) => {
  // On Connecting Error
  console.log(error);
});
connection.on("connecting", (data) => {
  // On Connection Attempt
  console.log("Connecting to mongoose database......");
});
connection.on("open", (data) => {
  // On Database connected and open to use
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
app.post("/api/users/:_id/exercises", async (req, res) => {
  console.log(req.body);
  // --- User id To Insert Data--- //
  const data = req.body;
  // --- _id data comes from req.params --- //
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
  // --- Data Validation Passed --- //
  // --- Creating a Log Object --- //
  let _userLog = new LOG({
    description: description,
    duration: Number(duration),
  });
  // --- If user didnt provided date! seting up new date --- //
  if (!date) {
    _userLog.date = new Date().toISOString().substring(0, 10);
  } else {
    _userLog.date = date;
  }

  // --- User Validation & Updating Log Array --- //
  let userfound = await USER.findByIdAndUpdate(
    _id,
    {
      $push: {
        log: _userLog,
      },
    },
    { new: true }
  );
  if (!userfound) {
    // --- No User Found --- //
    console.log(`No User Found! with id:${_id}`);
    return res.send("No user found!");
  }
  // --- Saving user after Inserting new Log Array --- //
  await userfound.save();
  // --- Generating manual response --- //
  res.json({
    _id: userfound._id,
    username: userfound.username,
    date: new Date(_userLog.date).toDateString(),
    description: _userLog.description,
    duration: _userLog.duration,
  });
});

// --- Get User All Excercise Logs || Route Api --- //
app.get("/api/users/:_id/logs", async (req, res) => {
  // --- Get User ID From req.params (:_id) --- //
  const { _id } = req.params;
  console.log(_id);
  // --- Finding User by Id --- //
  let _user = await USER.findById(_id);
  // --- If No User Found --- //
  if (!_user) {
    console.log("No User Found!");
    return res.send("No User Found");
  }

  // --- converting each date value of log array into DateString --- //
  _user.log.forEach((record) => {
    record.date = new Date(record.date).toDateString();
  });

  // --- If user provided query params --- //
  if (req.query.from || req.query.to) {
    let fromDate = new Date(0); // max from date
    let toDate = new Date(); // max to date
    if (req.query.from) {
      fromDate = new Date(req.query.from); // if (from) provided then setting up new date object with it
    }
    if (req.query.to) {
      toDate = new Date(req.query.to); // if (to) provided then setting up new date object with it
    }
    // --- converting dates to unix-timelapse --- //
    fromDate = fromDate.getTime();
    toDate = toDate.getTime();
    // --- Comparing Dates with Filters & returning||saving --- //
    _user.log = _user.log.filter((record) => {
      let unixLogDate = new Date(record.date).getTime();
      return unixLogDate >= fromDate && unixLogDate <= toDate;
    });
  }
  // --- If Limit is provided --- //
  if (req.query.limit) {
    let { limit } = req.query;
    _user.log = _user.log.slice(0, limit);
  }

  // --- Sending Back The Response --- //
  res.json({
    username: _user.username,
    count: _user.log.length,
    _id: _user._id,
    log: _user.log,
  });
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
