import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// import { HiPhoto, HiOutlineMap } from "react-icons/hi2";

import { GetPlaceyByIdRoute } from "../../utils/Routes";
import axios from "axios";

import { BookingWidget, PlaceGallery, AddressLink } from "../../components";

const PlacePage = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Set initial loading state to true

  useEffect(() => {
    if (!id) {
      return;
    }

    axios
      .get(`${GetPlaceyByIdRoute}/${id}`)
      .then((res) => {
        setPlace(res.data);
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error(error);
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false); // Set loading state to false after a delay
        }, 1000); // Adjust the delay time (in milliseconds) as needed
      });

    console.log(place);
  }, [id]);

  if (!place) return "";

  return (
    <div className=" bg-gray-100 -mx-8  pt-8">
      <div className="container">
        <h1 className="text-3xl relative">{place?.title}</h1>
        <AddressLink>{place.address}</AddressLink>

        <PlaceGallery place={place} isLoading={isLoading} />

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] mt-8 mb-8">
          <div className="pr-10">
            <div className="my-4">
              <h2 className="font-semibold text-2xl mb-4">Description</h2>
              {place.description}
            </div>
            Check-in: {place.checkIn} <br />
            Check-out: {place.checkOut} <br />
            Max numbers of guest: {place.maxGuests}
          </div>
          <div>
            <BookingWidget place={place} />
          </div>
        </div>
      </div>{" "}
      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div className="container">
          <div>
            <h2 className="font-semibold text-2xl">Extra info</h2>
          </div>
          <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">
            {place.extraInfo}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacePage;
