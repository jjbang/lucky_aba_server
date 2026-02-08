import { LANG } from "../constants";

export const langSuccess = (lang) => ({
  type: LANG.LANG_SUCCESS,
  lang: lang,
});
