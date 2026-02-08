import { LANG } from "./../constants";

const initialState = {
  currentLang: "en-US",
  loading: false,
  error: {},
};

export default function lang(state = initialState, action) {
  switch (action.type) {
    case LANG.LANG_INIT:
      return {
        ...state,
        loading: false,
      };
    case LANG.LANG_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        currentLang: action.lang.currentLang,
      };
    case LANG.LANG_ERROR:
      return {
        ...state,
        loading: false,
        error: action.lang.error,
      };
    default:
      return state;
  }
}
