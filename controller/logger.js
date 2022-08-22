// --- Connection details --- //
async function Logger(req, res, next) {
  let date = new Date(); // date of request
  // tracks request Ip, Path, and Date of request
  console.log(
    "User> IP:" +
      req.ip +
      " PATH:" +
      req.path +
      " Date: " +
      date.toDateString()
  );
  next(); // hand-over to next middleware
}
module.exports = Logger; // exporting function
