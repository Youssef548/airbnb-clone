import React, { useContext } from "react";
import { UserContext } from "../store/UserContext";
import { Navigate } from "react-router-dom";

const AccountPage = () => {
  const { isLoading, user } = useContext(UserContext);

  if (isLoading) {
    return "Loading...";
  }

  if (!isLoading && !user) {
    return <Navigate to={"/login"} />;
  }

  return <div>account page for {user.name}</div>;
};

export default AccountPage;
