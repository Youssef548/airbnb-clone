import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../store/UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import { LogoutRoute } from "../../utils/Routes";
import makeReq from "../../libs/axiosInstance";
import PlacesPage from "../Places/PlacesPage";
import { AccountNav } from "../../components";

const AccountPage = () => {
  const { isLoading, setIsLoading, user, setUser } = useContext(UserContext);
  const [redirect, setRedirect] = useState(null);

  let { subpage } = useParams();
  if (subpage === undefined) {
    subpage = "profile";
  }

  useEffect(() => {
    if (user) setIsLoading(false);
  }, []);

  const logoutHandler = async () => {
    try {
      await makeReq.post(LogoutRoute);
      setRedirect("/");
      setUser(null);
    } catch (err) {
      console.log(err);
    }
  };

  if (isLoading) {
    return "Loading...";
  }

  if (!isLoading && !user && !redirect) {
    return <Navigate to={"/login"} />;
  }

  if (redirect) return <Navigate to={redirect} />;

  return (
    <div>
      <AccountNav />

      {subpage === "profile" && (
        <div className="text-center max-w-lg mx-auto">
          Logged in as {user.name} ({user.email})<br />
          <button
            onClick={() => logoutHandler()}
            className="primary max-w-sm mt-2"
          >
            Logout
          </button>
        </div>
      )}
      {subpage === "places" && <PlacesPage />}
    </div>
  );
};

export default AccountPage;
