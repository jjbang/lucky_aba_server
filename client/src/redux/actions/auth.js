import { AUTH } from "../constants";

export const authSuccess = (auth) => ({
  type: AUTH.LOGIN_SUCCESS,
  auth: auth,
});
