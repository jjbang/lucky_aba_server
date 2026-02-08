import React from "react";
import { Route, Switch } from "react-router-dom";
import routes from "./constants/routes.json";
import App from "./containers/App";
import LoginPage from "./containers/LoginPage";
export default function Routes() {
  return (
    <Switch>
      <Route exact path={routes.Login} component={LoginPage} />
    </Switch>
  );
}
