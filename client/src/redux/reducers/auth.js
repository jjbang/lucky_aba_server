import { AUTH } from "./../constants";

const initialState = {
  user: {},
  token: {},
  isLoggedIn: false,
  error: {},
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case AUTH.LOGIN_INIT:
      return {
        ...state,
        loading: true,
      };
    case AUTH.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        user: action.auth.user,
        token: action.auth.token,
      };
    case AUTH.LOGIN_ERROR:
      return {
        ...state,
        loading: false,
        error: action.auth.error,
      };
    default:
      return state;
  }
}
