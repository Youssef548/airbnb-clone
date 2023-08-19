import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { HiPhoto, HiOutlineMap } from "react-icons/hi2";

import { GetPlaceyByIdRoute } from "../../utils/Routes";
import axios from "axios";

import { BookingWidget, PlaceGallery, AddressLink } from "../../components";

const PlacePage = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`${GetPlaceyByIdRoute}/${id}`).then((res) => {
      return setPlace(res.data);
    });
  }, [id]);

  if (!place) return "";

  return (
    <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
      <h1 className="text-3xl">{place?.title}</h1>
      <AddressLink>{place.address}</AddressLink>

      <PlaceGallery place={place} />

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] mt-8 mb-8">
        <div>
          <div className="my-4">
            <h2 className="font-semibold text-2xl">Description</h2>
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

      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Extra info</h2>
        </div>
        <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">
          {place.extraInfo}
        </div>
      </div>
    </div>
  );
};

export default PlacePage;
