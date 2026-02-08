import React, { Component } from "react";
import { Select } from "antd";
import io from "socket.io-client";
import moment, { Moment } from "moment";
import "../Common.global.css";
import logoMainOCC from "../../images/logo-sp.png";
import logoABA from "../../images/aba_logo.svg";
import logoKHQR from "../../images/khqr.svg";
import logoSupport from "../../images/support.svg";
import divider from "../../images/divider.svg";
import riel from "../../images/riel.png";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const ABASocket = io.connect("http://localhost:4034");

const flexColumnOverflow = {
  display: "flex",
  flex: "auto",
  flexDirection: "column",
  overflowY: "scroll",
};
const flexColumn = {
  display: "flex",
  flex: "auto",
  flexDirection: "column",
};
const documentImgContainer = {
  width: "100%",
  height: "100%",
  backgroundColor: "rgb(212, 212, 212)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      qrImage: null,
      qrRecipient: "",
      isInitialLoading: false,
      isLoading: false,
      checkTransactionInterval: null,
      transactionId: null,
      merchantId: null,
      reqTime: null,
      checkTransactionHash: null,
      amount: null,
      showSuccessMessage: false,
    };
  }

  componentDidMount() {
    ABASocket.on(
      "create-transaction",
      ({
        qrRecipient,
        qrImage,
        transactionId,
        checkTransactionUrl,
        merchantId,
        reqTime,
        amount,
        checkTransactionHash,
      }) => {
        const { checkTransactionInterval } = this.state;

        if (checkTransactionInterval) {
          clearInterval(checkTransactionInterval);
        }

        this.setState({
          qrRecipient,
          qrImage,
          transactionId,
          checkTransactionUrl,
          merchantId,
          reqTime,
          amount,
          checkTransactionHash,
          checkTransactionInterval: setInterval(
            () => this.checkTransaction(),
            4000
          ),
          isABA: true,
        });
      }
    );
    ABASocket.on("cancel-transaction", ({}) => {
      this.clearTransaction();
    });
  }

  componentWillUnmount() {
    const { checkTransactionInterval } = this.state;
    checkTransactionInterval && clearInterval(checkTransactionInterval);
    ABASocket && ABASocket.close();
  }

  clearTransaction() {
    const { checkTransactionInterval } = this.state;
    checkTransactionInterval && clearInterval(checkTransactionInterval);
    this.setState({
      qrImage: null,
      amount: null,
      transactionId: null,
      checkTransactionUrl: null,
      merchantId: null,
      reqTime: null,
      checkTransactionHash: null,
      checkTransactionInterval: null,
      isABA: false,
    });
  }

  checkTransaction() {
    const {
      checkTransactionUrl,
      merchantId,
      reqTime,
      checkTransactionHash,
      transactionId,
    } = this.state;
    fetch("/abachecktransaction", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        checkTransactionUrl,
        req_time: reqTime,
        merchant_id: merchantId,
        tran_id: transactionId,
        hash: checkTransactionHash,
      }),
    })
      .then((result) => result.json())
      .then(({ status, data }) => {
        const { payment_status } = data;
        const { code, tran_id } = status;

        console.log(data);
        if (code === "00" && tran_id !== String(transactionId)) {
          console.log("Transaction not same");
          return this.clearTransaction();
        }

        if (
          code === "00" &&
          tran_id === String(transactionId) &&
          payment_status === "APPROVED"
        ) {
          console.log("Transaction Complete");
          // SEND REQUEST BACK TO CLIENT
          fetch("http://localhost:4077/complete", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              transactionId,
            }),
          });
          this.setState({
            showSuccessMessage: true,
          });
          setTimeout(() => {
            this.setState({
              showSuccessMessage: false,
            });
          }, "4000");
          return this.clearTransaction();
        }
      });
  }

  render() {
    const { isABA, qrImage, amount, showSuccessMessage, qrRecipient } =
      this.state;

    return (
      <>
        {isABA ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "0 0 700px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                flex: "0 0",
              }}
            >
              <img
                src={logoABA}
                style={{
                  width: "100%",
                  marginBottom: "80px",
                  marginTop: "80px",
                }}
              ></img>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                flex: "0 0",
                borderColor: "red",
                border: "0.1px solid",
                borderRadius: "60px",
                backgroundColor: "white",
              }}
            >
              <div>
                <img
                  src={logoKHQR}
                  style={{
                    width: "100%",
                  }}
                ></img>
              </div>
              <div
                style={{
                  color: "black",
                  paddingLeft: "85px",
                  width: "100%",
                  display: "flex",
                  fontSize: "30px",
                  flexDirection: "row",
                }}
              >
                {qrRecipient}
              </div>
              <div
                style={{
                  color: "black",
                  paddingLeft: "85px",
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "55px" }}>
                  {amount
                    ? String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "-"}
                </span>
                <span
                  style={{
                    alignSelf: "center",
                    paddingLeft: "15px",
                    fontSize: "34px",
                  }}
                >
                  KHR
                </span>
              </div>
              <img
                src={divider}
                style={{
                  width: "100%",
                  paddingTop: "20px",
                }}
              ></img>
              <div
                style={{
                  padding: "40px 50px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={riel}
                  style={{
                    width: "100px",
                    position: "absolute",
                  }}
                ></img>
                <img style={{ width: "100%" }} src={qrImage}></img>
              </div>
            </div>
            <div>
              <img
                src={logoSupport}
                style={{
                  width: "100%",
                  marginTop: "80px",
                }}
              ></img>
            </div>
          </div>
        ) : (
          <div
            className="site-feature-container"
            style={{ position: "relative" }}
          >
            {showSuccessMessage ? (
              <div
                style={{
                  position: "absolute",
                  backgroundColor: "#49e149",
                  height: "100%",
                  width: "100%",
                  zIndex: 99999,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <div>
                  <CheckCircleOutlined
                    style={{ color: "white", fontSize: "500px" }}
                  />
                </div>
                <div
                  style={{
                    color: "white",
                    fontSize: "80px",
                    marginTop: "30px",
                  }}
                >
                  Payment Complete
                </div>
              </div>
            ) : (
              <></>
            )}
            <div
              className={`visitorSessionLayoutContainer visitorSessionLayoutContainerBackground occ-theme`}
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                zIndex: 9999,
              }}
            >
              <div
                className={`visitorSessionLayoutOverlay`}
                style={{
                  opacity: "0.4",
                  flex: "1 1 auto",
                  backgroundColor: "black",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: "0 0 300px",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* <img alt="logo" src={logoMainOCC} style={{ width: "120px" }} /> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
