import { put, select, takeEvery } from "redux-saga/effects";
import { AUTH } from "../constants";
import { authSuccess } from "./../actions/auth";
import { getToken, setToken } from "./../helper/localstorageHelper";

function* handleAuth() {
  const token = getToken("token");
  const user = getToken("user");
  if (token && user) {
    yield put(
      authSuccess({ token: JSON.parse(token), user: JSON.parse(user) })
    );
  }
}

function* handleStoreAuth() {
  const data = yield select((state) => state.auth);
  setToken("token", JSON.stringify(data.token));
  setToken("user", JSON.stringify(data.user));
}

export default function* watchAuth() {
  yield takeEvery(AUTH.LOGIN_INIT, handleAuth);
  yield takeEvery(AUTH.LOGIN_SUCCESS, handleStoreAuth);
}
