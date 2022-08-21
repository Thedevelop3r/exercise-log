// --- Connection details --- //

async function Logger(req, res, next) {
  let date = new Date();

  console.log(
    "User> IP:" +
      req.ip +
      " PATH:" +
      req.path +
      " Date: " +
      date.toDateString()
  );
  next();
}

module.exports = Logger;
