import { useEffect } from "react";
import { useAuth } from "../../context/authContext";
import withRouter from "../../hoc/withRouter";

const ProtectedRoute = ({ element, location, navigate }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [user, navigate, location]);

  if (!user) return null;
  return element;
};

export default withRouter(ProtectedRoute);
