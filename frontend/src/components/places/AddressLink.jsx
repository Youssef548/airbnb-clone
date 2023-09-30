import React from "react";
// import { HiOutlineMap } from "react-icons/hi2";

const AddressLink = ({ children, className = null }) => {
  if (!className) {
    className = "my-3 block";
  }
  className += " flex items-center gap-2 font-semibold underline";

  return (
    <a
      className={className}
      target="_blank"
      href={`https://maps.google.com/?q=${children}`}
    >
      {/* <HiOutlineMap /> */}
      {children}
    </a>
  );
};

export default AddressLink;
