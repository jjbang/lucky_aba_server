import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux";
import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { AUTH, LANG } from "../constants";
import createRootReducer from "../reducers";
import rootSaga from "../sagas";

const history = createBrowserHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    rootReducer,
    compose(applyMiddleware(sagaMiddleware, router, logger))
  );
  sagaMiddleware.run(rootSaga);
  store.dispatch({ type: AUTH.LOGIN_INIT });
  store.dispatch({ type: LANG.LANG_INIT });
  return store;
};
const exportedObj = { configureStore, history };
export default exportedObj;
