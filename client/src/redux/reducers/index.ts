import { connectRouter } from "connected-react-router";
import { History } from "history";
import { combineReducers } from "redux";
import auth from "./auth";
import lang from "./lang";

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    auth: auth,
    lang: lang,
  });
}
