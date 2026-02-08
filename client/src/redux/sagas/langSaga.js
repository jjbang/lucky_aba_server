import { put, select, takeEvery } from "redux-saga/effects";
import { LANG } from "../constants";
import { langSuccess } from "./../actions/lang";
import { getToken, setToken } from "./../helper/localstorageHelper";

function* handleLang() {
  const lang = getToken("lang");
  if (lang) {
    yield put(langSuccess({ currentLang: lang }));
  }
}

function* handleStoreLang() {
  const data = yield select((state) => {
    return state.lang;
  });
  setToken("lang", data.currentLang);
}

export default function* watchAuth() {
  yield takeEvery(LANG.LANG_INIT, handleLang);
  yield takeEvery(LANG.LANG_SUCCESS, handleStoreLang);
}
