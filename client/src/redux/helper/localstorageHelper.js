const getToken = (key) => {
  return localStorage.getItem(key);
};

const setToken = (key, vallue) => {
  localStorage.setItem(key, vallue);
};

export { getToken, setToken };
