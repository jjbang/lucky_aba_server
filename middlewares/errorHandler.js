"use strict";

module.exports = (err, req, res, next) => {
  try {
    res.status(err.code || 401).send({
      data: {},
      error: err.error,
      success: false,
      status: err.code || 401,
    });
  } catch (err) {
    res.status(401).send({
      data: "Something went wrong. Please try again",
      error: err,
      success: false,
      status: 401,
    });
  }
};
