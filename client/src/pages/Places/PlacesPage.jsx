import React from "react";
import { Link } from "react-router-dom";

import { AiOutlinePlus } from "react-icons/ai";
import AccountNavPage from "../Profile/AccountNavPage";

const PlacesPage = () => {
  return (
    <div>
      <AccountNavPage />

      <div className="text-center">
        <Link
          className="inline-flex gap-1 items-center bg-primary py-2 px-6 rounded-full text-white"
          to={"/account/places/new"}
        >
          <AiOutlinePlus /> Add new place
        </Link>
      </div>

      {/* {action == "new" && <FormPlacesPage />} */}
    </div>
  );
};

export default PlacesPage;
