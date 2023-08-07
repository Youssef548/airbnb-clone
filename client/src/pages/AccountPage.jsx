import React, { useState, useContext } from "react";
import { UserContext } from "../store/UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import { LogoutRoute } from "../utils/Routes";
import axios from "axios";
import PlacesPage from "./PlacesPage";

import { AiOutlineUser, AiOutlineUnorderedList } from "react-icons/ai";
import { HiOutlineHomeModern } from "react-icons/hi2";

const AccountPage = () => {
  const { isLoading, user, setUser } = useContext(UserContext);
  const [redirect, setRedirect] = useState(null);

  let { subpage } = useParams();
  if (subpage === undefined) {
    subpage = "profile";
  }

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

  const linkClasses = (type = null) => {
    let classes = "py-2 px-6 inline-flex gap-2 items-center rounded-full";
    if (subpage === type) {
      classes += " bg-primary text-white ";
    } else {
      classes += " bg-gray-200";
    }

    return classes;
  };

  if (redirect) return <Navigate to={redirect} />;

  return (
    <div>
      <nav className=" w-full flex justify-center mt-8 mb-8 gap-2 ">
        <Link className={linkClasses("profile")} to={"/account"}>
          <AiOutlineUser />
          My Profile
        </Link>
        <Link className={linkClasses("bookings")} to={"/account/bookings"}>
          <AiOutlineUnorderedList /> My bookings
        </Link>

        <Link className={linkClasses("places")} to={"/account/places"}>
          <HiOutlineHomeModern />
          My accommodations
        </Link>
      </nav>

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
