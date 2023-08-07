import React from "react";
import { Link, useParams } from "react-router-dom";

import { AiOutlinePlus } from "react-icons/ai";
const PlacesPage = () => {
  const { action } = useParams();

  return (
    <div>
      {action !== "new" && (
        <div className="text-center">
          <Link
            className="inline-flex gap-1 items-center bg-primary py-2 px-6 rounded-full text-white"
            to={"/account/places/new"}
          >
            <AiOutlinePlus /> Add new place
          </Link>
        </div>
      )}
      {action == "new" && (
        <div>
          <form action="">
            <h2 className="text-2xl mt-4">Title</h2>
            <p className="text-gray-500 text-sm">
              title/heading for your place. should be short and catchy as in
              advertisment
            </p>
            <input
              type="text"
              placeholder="title, for example: My lovely apt"
            />
            <h2 className="text-2xl mt-4">Address</h2>
            <p className="text-gray-500 text-sm"> Address to this place</p>
            <input type="text" placeholder="address" />
            <h2 className="text-2xl mt-4">Photos</h2>
            <p className="text-gray-500 text-sm"> more = better</p>
            <div className="mt-2 grid grid-cols-3 lg:grid-cols-6 md:grid-cols-4">
              <button className="border bg-transparent rounded-2xl p-8 text-2xl text-gray-600">
                +
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlacesPage;
