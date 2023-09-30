import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import makeReq from "../../libs/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../Skeleton/Skeleton";

const PlaceGallery = ({ place, isLoading }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (showAllPhotos) {
    return (
      <>
        <AnimatePresence>
          {showAllPhotos && (
            <motion.div
              className="absolute inset-0  text-white min-h-screen opacity-[50%]"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className=" p-8 grid gap-10 justify-center relative">
                <button
                  className="fixed left-8 top-4 p-2 rounded-full hover:bg-gray-200  bg-white text-black"
                  onClick={() => setShowAllPhotos(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <div className="absolute top-0 left-0 w-full h-full  bg-black/50 -z-[1] backdrop-blur-sm"></div>
                <div className="">
                  <h2 className="text-3xl mr-48 text-white drop-shadow-md">
                    Photos of {place.title}
                  </h2>
                </div>
                {place?.photos?.length > 0 &&
                  place.photos.map((photo, index) => (
                    <div key={index}>
                      <img
                        loading="lazy"
                        className="w-[1000px] rounded-xl"
                        src={`${photo}`}
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
      <div className="grid gap-4 grid-cols-3 rounded-3xl overflow-hidden">
        {/* Photo 1 */}
        <div className="col-span-2 h-full">
          {place.photos?.[0] && (
            <div>
              {isLoading ? ( // Add a conditional rendering block for the skeleton
                <div className="w-full bg-white relative">
                  <div className="aspect-[1/1]">
                    <Skeleton height="aspect-square object-cover cursor-pointer hover:opacity-90 transition-all w-full" />
                  </div>
                </div>
              ) : (
                <div className="w-full bg-gray-300 relative">
                  <div className="aspect-[1/1]">
                    <img
                      loading="lazy"
                      onClick={() => setShowAllPhotos(true)}
                      className="aspect-square object-cover cursor-pointer hover:opacity-90 transition-all w-full"
                      src={`${place.photos[0]}`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Photos 2 and 3 */}
        <div className="flex flex-col gap-4 col-span-1">
          {place.photos?.slice(1, 3).map((photo, index) => (
            <div key={index}>
              {isLoading ? ( // Add a conditional rendering block for the skeleton
                <div className="w-full bg-white relative">
                  <div className="aspect-[1/1]">
                    <Skeleton height="aspect-square object-cover cursor-pointer hover:opacity-90 transition-all" />
                  </div>
                </div>
              ) : (
                <div className="w-full bg-gray-300 relative">
                  <div className="aspect-[1/1]">
                    <img
                      loading="lazy"
                      onClick={() => setShowAllPhotos(true)}
                      className="aspect-square object-cover cursor-pointer hover:opacity-90 transition-all"
                      src={`${photo}`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setShowAllPhotos(true)}
        className="flex gap-2 items-center absolute bottom-2 right-2 py-2 px-4 rounded-2xl bg-white  "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        Show more photos
      </button>
    </div>
  );
};

export default PlaceGallery;
