// components/ProtectedRoute.js
import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../store/useStore";

const ProtectedRoute = () => {
  const { user } = useUserStore();

  return user !== null ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
