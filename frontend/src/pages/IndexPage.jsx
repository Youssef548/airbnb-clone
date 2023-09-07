import React, { useEffect, useState } from "react";
import { Header } from "../components";
import { GetPlaces } from "../utils/Routes";

import { Link } from "react-router-dom";

import axios from "axios";

const url = import.meta.env.VITE_URL;

const IndexPage = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get(GetPlaces).then((res) => {
      setPlaces([...res.data]);
    });
  }, []);
  return (
    <div className="mt-8 gap-x-6 gap-y-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {places.length > 0 &&
        places.map((place, index) => {
          return (
            <Link key={index} to={`/place/${place._id}`}>
              <div className="bg-gray-500 rounded-2xl flex mb-2">
                {place.photos?.[0] && (
                  <img
                    className="rounded-2xl object-cover aspect-square"
                    src={`${place.photos?.[0]}`}
                    // src={"http://localhost:5000/uploads/" + place.photos?.[0]}
                  />
                )}
              </div>
              <h2 className="font-bold">{place.address}</h2>
              <h3 className="text-sm truncate text-gray">{place.title}</h3>
              <div className="mt-1">
                <span className="font-bold">${place.price}</span> per night
              </div>
            </Link>
          );
        })}
    </div>
  );
};

export default IndexPage;
