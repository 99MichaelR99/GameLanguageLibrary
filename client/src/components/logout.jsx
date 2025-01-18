// logout.js
import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import withRouter from "../hoc/withRouter";

const Logout = ({ navigate }) => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  return null;
};

export default withRouter(Logout);
