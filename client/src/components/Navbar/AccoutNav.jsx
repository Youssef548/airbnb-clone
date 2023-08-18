import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineUser, AiOutlineUnorderedList } from "react-icons/ai";
import { HiOutlineHomeModern } from "react-icons/hi2";

const AccountNav = () => {
  const { pathname } = useLocation();
  let subpage = pathname.split("/")?.[2];
  if (subpage === undefined) {
    subpage = "profile";
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

  return (
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
  );
};

export default AccountNav;
