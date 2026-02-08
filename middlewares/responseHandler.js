"use strict";

module.exports = (req, res) => {
  const response = {};

  if (res.body) {
    response.data = res.body.data || {};
    response.success = !response.err;
    response.code = res.body.code || 200;
    res.status(response.code).send(response);
  } else {
    response.err = "UNAUTHORIZED";
    response.data = {};
    response.success = false;
    response.code = 401;
    res.status(401).send(response);
  }
};
