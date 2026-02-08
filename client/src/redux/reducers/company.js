import { Action } from "redux";
import {
  GET_COMPANY_STARTED,
  GET_COMPANY_SUCCESS,
  GET_COMPANY_FAILURE,
} from "../actions/company";

const initialState = {
  loading: false,
  companies: [],
  error: null,
};

export default function company(state = initialState, action) {
  switch (action.type) {
    case GET_COMPANY_STARTED:
      return {
        ...state,
        loading: true,
      };
    case GET_COMPANY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        companies: action.payload,
      };
    case GET_COMPANY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
}
