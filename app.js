const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const moment = require("moment-timezone");
const FormData = require("form-data");
const axios = require("axios");
const https = require("https");

if (process.env.NODE_ENV !== "production") {
  const result = dotenv.config({ path: path.join(__dirname, ".env") });
  if (result.error) {
    throw result.error;
  }
}

const { errorHandler } = require("./middlewares");
const morganMiddleware = require("./middlewares/morganMiddleware");
const logger = require("./lib/logger");

const app = express();
const io = require("socket.io")(4034, {
  cors: {
    origin: "*",
  },
});
const cashierSocket = require("socket.io")(4078, {
  cors: {
    origin: "*",
  },
});

process.on("SIGTERM", () => {
  logger.error("SIGTERM signal received: closing HTTP server");
  io.close(() => {
    logger.debug("io server closed");
  });
  cashierSocket.close(() => {
    logger.debug("cashier socket closed");
  });
  process.exit();
});
process.on("SIGINT", () => {
  logger.error("SIGTERM signal received: closing HTTP server");
  io.close(() => {
    logger.debug("io server closed");
  });
  cashierSocket.close(() => {
    logger.debug("cashier socket closed");
  });
  process.exit();
});

app.use(express.static("public"));

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "client/build")));
//   app.get("*", function (req, res) {
//     res.sendFile(path.join(__dirname, "client/build", "index.html"));
//   });
// }

app.set("port", process.env.PORT || 4077);
app.set("views", __dirname + "/views");
app.set("view engine", "hbs");

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(cors());
app.use(morganMiddleware);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.render("home");
});

function getHash(str) {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(str);
  return hmac.digest("base64");
}

const ABA_PAYWAY_API_URL = process.env.ABA_PAYWAY_API_URL;
const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID;
const ABA_SITE_PREFIX = process.env.SITE_PREFIX;

// Rates should be this format
// [{ name: "1h - 2h", quantity: "1", price: "10000" }]

app.post("/abachecktransaction", async (req, res) => {
  const { checkTransactionUrl, req_time, merchant_id, tran_id, hash } =
    req.body;

  try {
    const abaResponse = await axios.post(
      checkTransactionUrl,
      {
        req_time,
        merchant_id,
        tran_id,
        hash,
      },
      {
        validateStatus: function (status) {
          return status < 500;
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        timeout: 4000,
      }
    );

    if (!abaResponse) {
      throw new Error(
        `Unexpected aba response. Expected response but received null.`
      );
    }

    const { data, status } = abaResponse;
    if (status < 200 || status >= 300) {
      throw new Error(
        `Error retrieving aba check transaction with status: ${abaResponse.status}`
      );
    } else {
      logger.debug(`Valid ABA Check Transaction: ${abaResponse.status}`);
      logger.debug(data);

      return res.json({
        ...data,
      });
    }
  } catch (e) {
    logger.error(e);
    return res.status(500).send({
      message: `Error making request to ABA Server: ${e}`,
    });
  }
});

app.post("/complete", async (req, res) => {
  const { transactionId } = req.body;
  cashierSocket.emit("abacomplete", {
    transactionId,
  });
  return res.json({});
});

app.post("/abacancel", async (req, res) => {
  io.emit("cancel-transaction", {});
  return res.json({});
});

app.post("/abacheckout", async (req, res) => {
  const { amount } = req.body;
  if (!amount) {
    return res.status(400).send({
      message: "Amount is required",
    });
  }

  // const items = Buffer.from(JSON.stringify(rates)).toString("base64");
  const dateNow = Date.now();
  const reqTime = Math.floor(dateNow / 1000);
  const transactionId = `${ABA_SITE_PREFIX}${reqTime}`;
  const merchantId = ABA_PAYWAY_MERCHANT_ID;
  const type = "purchase";
  const currency = "KHR";

  const hashVal = reqTime + merchantId + transactionId + amount;
  const hash = getHash(hashVal);
  const checkTransactionHash = getHash(reqTime + merchantId + transactionId);
  const checkTransactionUrl = process.env.ABA_PAYWAY_CHECK_TRANSACTION_URL;

  const qrRecipient = process.env.ABA_PAYWAY_RECIPIENT;

  const formData = new FormData();
  formData.append("hash", hash);
  formData.append("merchant_id", merchantId);
  formData.append("req_time", reqTime);
  formData.append("tran_id", transactionId);
  formData.append("amount", amount);

  try {
    const abaResponse = await axios.post(ABA_PAYWAY_API_URL, formData);

    if (!abaResponse) {
      throw new Error(
        `Unexpected aba response. Expected response but received null.`
      );
    }

    const { data, status } = abaResponse;
    if (status < 200 || status >= 300) {
      throw new Error(
        `Error retrieving aba qr with status: ${abaResponse.status}`
      );
    } else {
      logger.debug(`Valid ABA Response: ${abaResponse.status}`);
      logger.debug(data);
      if (
        data &&
        data.status &&
        data.status.code === "00" &&
        data.status.tran_id === String(transactionId)
      ) {
        logger.debug(data);
        io.emit("create-transaction", {
          ...data,
          qrRecipient,
          checkTransactionUrl,
          transactionId,
          merchantId,
          reqTime,
          checkTransactionHash,
          amount,
        });
        return res.json({
          ...data,
          qrRecipient,
          checkTransactionUrl,
          transactionId,
          merchantId,
          reqTime,
          checkTransactionHash,
          amount,
        });
      } else {
        throw new Error(`Unknown aba response data`);
      }
    }
  } catch (e) {
    logger.error(e);
    return res.status(500).send({
      message: `Error making request to ABA Server: ${e}`,
    });
  }
});

app.post("/abacheckout2", async (req, res) => {
  const { amount } = req.body;
  if (!amount) {
    return res.status(400).send({
      message: "Amount is required",
    });
  }

  // const items = Buffer.from(JSON.stringify(rates)).toString("base64");
  const reqTime = moment()
    .tz("Asia/Bangkok")
    .format("YYYYMMDDHHmmss");
  const transactionId = `${ABA_SITE_PREFIX}${reqTime}`;
  const merchantId = ABA_PAYWAY_MERCHANT_ID;
  const type = "purchase";
  const currency = "USD";
  const payment_option = 'abapay_khqr';
  const lifetime = 3;
  const qr_image_template = "template1"

  const hashVal = reqTime + merchantId + transactionId + amount + payment_option + currency + lifetime + qr_image_template;
  const hash = getHash(hashVal);
  const checkTransactionHash = getHash(reqTime + merchantId + transactionId);
  const checkTransactionUrl = process.env.ABA_PAYWAY_CHECK_TRANSACTION_URL;

  const qrRecipient = process.env.ABA_PAYWAY_RECIPIENT;

  logger.warn(ABA_PAYWAY_API_URL);
  logger.warn(
    {
      req_time: reqTime,
      merchant_id: merchantId,
      tran_id: transactionId,
      amount,
      currency,
      hash,
      payment_option,
      lifetime,
      qr_image_template
    }
  );

  try {
    const abaResponse = await axios.post(ABA_PAYWAY_API_URL,
      {
        req_time: reqTime,
        merchant_id: merchantId,
        tran_id: transactionId,
        amount,
        currency,
        hash,
        payment_option,
        lifetime,
        qr_image_template,
      },
      {
        validateStatus: function (status) {
          return status < 500;
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        timeout: 4000,
      }
    );

    if (!abaResponse) {
      throw new Error(
        `Unexpected aba response. Expected response but received null.`
      );
    }

    const { data, status } = abaResponse;
    logger.error(data);
    if (status < 200 || status >= 300) {
      throw new Error(
        `Error retrieving aba qr with status: ${abaResponse.status}`
      );
    } else {
      logger.debug(`Valid ABA Response: ${abaResponse.status}`);
      logger.debug(data);
      if (
        data &&
        data.status &&
        data.status.code === "0" &&
        data.status.tran_id === String(transactionId)
      ) {
        logger.debug(data);
        io.emit("create-transaction", {
          ...data,
          qrRecipient,
          checkTransactionUrl,
          transactionId,
          merchantId,
          reqTime,
          checkTransactionHash,
          amount,
        });
        return res.json({
          ...data,
          qrRecipient,
          checkTransactionUrl,
          transactionId,
          merchantId,
          reqTime,
          checkTransactionHash,
          amount,
        });
      } else {
        throw new Error(`Unknown aba response data`);
      }
    }
  } catch (e) {
    logger.error(e);
    return res.status(500).send({
      message: `Error making request to ABA Server: ${e}`,
    });
  }
});

// *****************************************
// Start Server
// *****************************************

app.listen(app.get("port"), () => {
  logger.debug(`App is running at http://localhost:${app.get("port")}`);
  logger.debug("Press CTRL-C to stop\n");
});
