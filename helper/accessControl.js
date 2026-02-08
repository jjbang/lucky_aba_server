const db = require("../db/index");

const accessControlDetails = {
  endpoint: "",
  username: "",
  password: "",
  eventPassword: "",
  isInitialized: false,
};
const getAPICredentials = `
  SELECT ac.endpoint, ac.username, ac.password, ac.event_password
  FROM  interface_api ac;
`;

module.exports = {
  initialize: (endpoint, username, password, eventPassword) => {
    accessControlDetails.endpoint = endpoint;
    accessControlDetails.username = username;
    accessControlDetails.password = password;
    accessControlDetails.eventPassword = eventPassword;
  },
  updateAPICredentials: (endpoint, username, password, eventPassword) => {
    accessControlDetails.endpoint = endpoint;
    accessControlDetails.username = username;
    accessControlDetails.password = password;
    accessControlDetails.eventPassword = eventPassword;
  },
  getAccessControlDetails: async () => {
    if (!accessControlDetails.isInitialized) {
      const client = await db.getClientAsync();
      try {
        const apiCredRes = await client.query(getAPICredentials);
        if (apiCredRes.rowCount === 0) {
          throw new Error();
        }
        const { endpoint, username, password, event_password } =
          apiCredRes.rows[0];
        accessControlDetails.endpoint = endpoint;
        accessControlDetails.username = username;
        accessControlDetails.password = password;
        accessControlDetails.eventPassword = event_password;
        accessControlDetails.isInitialized = true;
        return accessControlDetails;
      } catch (e) {
        console.log("Failed to retrieve API Credentials");
        throw e;
      } finally {
        client.release();
      }
    }
    return accessControlDetails;
  },
};
