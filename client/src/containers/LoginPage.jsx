import { connect } from "react-redux";
import Login from "../components/Login/Login";
import { authSuccess } from "../redux/actions/auth";

const mapDispatchToProps = (dispatch) => ({
  authSuccess: (auth) => dispatch(authSuccess(auth)),
});

export default connect(null, mapDispatchToProps)(Login);
