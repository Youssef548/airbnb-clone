import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AiOutlinePlus } from "react-icons/ai";
import AccountNavPage from "../Profile/AccountNavPage";
import axios from "axios";
import { GetUserPlacesRoute } from "../../utils/Routes";

const PlacesPage = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios
      .get(GetUserPlacesRoute, { withCredentials: true })
      .then(({ data }) => {
        setPlaces(data);
      });
  }, []);

  return (
    <div>
      <AccountNavPage />

      <div className="text-center">
        list of all places
        <br />
        <Link
          className="inline-flex gap-1 items-center bg-primary py-2 px-6 rounded-full text-white"
          to={"/account/places/new"}
        >
          <AiOutlinePlus /> Add new place
        </Link>
      </div>
      <div className="mt-4">
        {places.length > 0 &&
          places.map((place, index) => {
            return (
              <Link
                to={`/account/places/${place._id}`}
                key={index}
                className="bg-gray-200 p-4 rounded-2xl flex gap-4 cursor-pointer"
              >
                <div className="flex w-32 h-32 bg-gray-300 shrink">
                  {place.photos.length > 0 && (
                    <img
                      className="object-cover"
                      src={"http://localhost:3000/uploads/" + place.photos[0]}
                      alt="placePhoto"
                    />
                  )}
                </div>

                <div className="grow-0">
                  <h2 className="text-xl ">{place.title}</h2>
                  <p className="text-sm mt-2">{place.description}</p>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default PlacesPage;
