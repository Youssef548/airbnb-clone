import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../store/UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import { LogoutRoute } from "../../utils/Routes";
import axios from "axios";
import PlacesPage from "../Places/PlacesPage";
import { AccountNavPage } from "../index";

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
      await axios.post(LogoutRoute, { withCredentials: true });
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
      <AccountNavPage />

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
