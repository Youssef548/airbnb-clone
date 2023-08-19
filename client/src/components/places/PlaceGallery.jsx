import React, { useState } from "react";
import { HiPhoto } from "react-icons/hi2";
import { AiOutlineClose } from "react-icons/ai";

import { motion, AnimatePresence } from "framer-motion";
const PlaceGallery = ({ place }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

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
  );
};

export default PlaceGallery;
