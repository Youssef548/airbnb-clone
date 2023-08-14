import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { HiPhoto, HiOutlineMap } from "react-icons/hi2";
import { AiOutlineClose } from "react-icons/ai";

import { motion, AnimatePresence } from "framer-motion";

import { GetPlaceyByIdRoute } from "../../utils/Routes";
import axios from "axios";

import { BookingWidget } from "../../components";

const PlacePage = () => {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`${GetPlaceyByIdRoute}/${id}`).then((res) => {
      return setPlace(res.data);
    });
  }, [id]);

  if (!place) return "";

  if (showAllPhotos) {
    return (
      <>
        <AnimatePresence>
          {showAllPhotos && (
            <motion.div
              className="absolute inset-0 bg-black text-white min-h-screen"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="bg-black p-8 grid gap-4">
                <div>
                  <h2 className="text-3xl mr-48">Photos of {place.title}</h2>
                  <button
                    className="fixed right-12 top-8 flex gap-1 items-center px-4 py-2 rounded-2xl shadow shadow-black bg-white text-black"
                    onClick={() => setShowAllPhotos(false)}
                  >
                    <AiOutlineClose />
                    Close Photos
                  </button>
                </div>
                {place?.photos?.length > 0 &&
                  place.photos.map((photo, index) => (
                    <div key={index}>
                      <img
                        src={`http://localhost:3000/uploads/${photo}`}
                        alt={`Photo ${index}`}
                      />
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>{" "}
      </>
    );
  }

  return (
    <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
      {<h1 className="text-3xl">{place?.title}</h1>}
      <a
        className="flex gap-1 items-center my-2  font-semibold underline"
        target="_blank"
        href={`https://maps.google.com/?q=${place.address}`}
      >
        <HiOutlineMap />
        {place?.address}
      </a>
      <div className="relative">
        <div className="grid gap-2 grid-cols-[2fr_1fr] rounded-3xl overflow-hidden">
          <div>
            {place.photos?.[0] && (
              <div>
                <img
                  onClick={() => setShowAllPhotos(true)}
                  className="aspect-square object-cover cursor-pointer hover:opacity-90 transition-all"
                  src={`http://localhost:3000/uploads/${place.photos[0]}`}
                />
              </div>
            )}
          </div>
          <div className="grid ">
            {place.photos?.[1] && (
              <div>
                <img
                  onClick={() => setShowAllPhotos(true)}
                  className="aspect-square object-cover cursor-pointer hover:opacity-90 transition-all"
                  src={`http://localhost:3000/uploads/${place.photos[1]}`}
                />
              </div>
            )}
            <div className="overflow-hidden">
              {place.photos?.[2] && (
                <div>
                  <img
                    onClick={() => setShowAllPhotos(true)}
                    className="aspect-square object-cover relative top-2 cursor-pointer hover:opacity-90 transition-all"
                    src={`http://localhost:3000/uploads/${place.photos[2]}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAllPhotos(true)}
          className="flex gap-2 items-center absolute bottom-2 right-2 py-2 px-4 rounded-2xl bg-white  shadow-md shadow-gray-500"
        >
          <HiPhoto /> Show more photos
        </button>
      </div>
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
