import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import langSaga from "./langSaga";

export default function* rootSaga() {
  yield all([authSaga(), langSaga()]);
}
