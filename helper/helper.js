const secretKey = process.env.JWT_SECRET_KEY;

module.exports = {
  msToTime: (duration) => {
    let minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return hours + ":" + minutes;
  },
  escapeXml: (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
      }
    });
  },
  verifyThirdPartyAuthorization: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];

    if (!token || token !== process.env.PUBLIC_TOKEN) {
      logger.error("Invalid token");
      const error = new Error("Authorization Invalid");
      error.statusCode = 403;
      return next(error); // if there isn't any token
    }
    return next();
  },
};
