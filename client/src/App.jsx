import { ConnectedRouter } from "connected-react-router";
import React, { Component, useEffect } from "react";
import { Provider } from "react-redux";
import { getToken } from "./redux/helper/localstorageHelper";
import { configureStore, history } from "./redux/store/configureStore";
import { message } from "antd";
import Routes from "./Routes";
const jwt = require("jsonwebtoken");
const store = configureStore();

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <TokenProvider>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </TokenProvider>
      </Provider>
    );
  }
}

export default App;

interface Props {
  children: React.ReactChild | React.ReactChildren;
}
const TokenProvider: React.FunctionComponent<Props> = ({ children }) => {
  useEffect(() => {
    // const token = getToken("token");
    // if (token) {
    //   const exp = jwt.decode(JSON.parse(token).accessToken).exp;
    //   const now = new Date();
    //   if (now.getTime() > exp * 1000) {
    //     localStorage.removeItem("token");
    //     message.error("Access token expired. Please login again.");
    //     history.push("/");
    //   }
    // } else {
    //   history.push("/");
    // }
  }, []);

  return <React.Fragment>{children}</React.Fragment>;
};
