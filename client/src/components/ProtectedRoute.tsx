import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../store/useStore";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { user } = useUserStore();

  // user is undefined = still loading (initial state before fetchUser resolves)
  if (user === undefined) {
    return <Loading />;
  }

  // user is null = not authenticated
  if (user === null) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
