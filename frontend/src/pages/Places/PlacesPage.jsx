import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetUserPlacesRoute } from "../../utils/Routes";
import { AccountNav, PlaceImg } from "../../components";
import makeReq from "../../libs/axiosInstance";
import { UserContext } from "../../store/UserContext";

const PlacesPage = () => {
  const { user } = useContext(UserContext);

  const [places, setPlaces] = useState([]);

  useEffect(() => {
    makeReq.get(GetUserPlacesRoute).then(({ data }) => {
      setPlaces(data);
    });
  }, [user]);

  return (
    <div>
      <AccountNav />
      <div className="text-center">
        <h1 className="text-2xl font-bold">List of All Places</h1>
        <Link
          to="/account/places/new"
          className="inline-flex items-center gap-1 bg-primary py-2 px-6 rounded-full text-white mt-4"
        >
          Add New Place
        </Link>
      </div>
      <div className="mt-4 flex flex-col gap-5 bg-gray-100 px-5 py-10">
        {places.length > 0 &&
          places.map((place, index) => (
            <Link
              to={`/account/places/${place._id}`}
              key={index}
              className="flex-col flex md:flex-row gap-4   overflow-hidden cursor-pointer"
            >
              <div className="w-full md:w-[300px] my-2 md:my-0">
                <PlaceImg
                  place={place}
                  className="rounded-lg w-full h-auto md:w-[300px] md:h-[200px]"
                />
              </div>

              <div className="">
                <h2 className="text-xl font-semibold">{place.title}</h2>
                <p className="text-sm mt-2 max-w-[600px]">
                  {place.description}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default PlacesPage;
