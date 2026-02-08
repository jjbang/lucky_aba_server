import axios from "axios";

export const GET_COMPANY_STARTED = "GET_COMPANY_STARTED";
export const GET_COMPANY_SUCCESS = "GET_COMPANY_SUCCESS";
export const GET_COMPANY_FAILURE = "GET_COMPANY_FAILURE";

//@ts-ignore
const getCompanySuccess = (company) => ({
  type: GET_COMPANY_SUCCESS,
  payload: {
    ...company,
  },
});

const getCompanyStarted = () => ({
  type: GET_COMPANY_STARTED,
});

//@ts-ignore
const getCompanyFailure = (error) => ({
  type: GET_COMPANY_FAILURE,
  payload: {
    error,
  },
});

export const addCompanyAsync = () => {
  //@ts-ignore
  return (dispatch) => {
    dispatch(getCompanyStarted());

    axios
      .get(`http://localhost:4040/company`)
      .then((res) => {
        return dispatch(getCompanySuccess(res.data));
      })
      .catch((err) => {
        return dispatch(getCompanyFailure(err.message));
      });
  };
};

export const getCompanyAsync = () => {
  //@ts-ignore
  return (dispatch) => {
    dispatch(getCompanyStarted());

    axios
      .get(`http://localhost:4040/company`)
      .then((res) => {
        return dispatch(getCompanySuccess(res.data));
      })
      .catch((err) => {
        return dispatch(getCompanyFailure(err.message));
      });
  };
};
