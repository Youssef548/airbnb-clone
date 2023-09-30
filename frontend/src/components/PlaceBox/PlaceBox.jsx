import React from "react";
import { Link } from "react-router-dom";
import Skeleton from "../Skeleton/Skeleton";

const PlaceBox = ({ place, isLoading, handleImageLoad }) => {
  return (
    <Link to={`/place/${place._id}`}>
      {isLoading ? (
        // Display a placeholder skeleton while loading
        <div className="w-full bg-white relative">
          <div className="aspect-[1/1]">
            <Skeleton rows={true} className={"bg-gray-100 animate-pulse"} />
          </div>
        </div>
      ) : (
        // Display the image when it's loaded
        <div className="w-full bg-gray-100 relative">
          <div className="aspect-[1/1]">
            <img
              loading="lazy"
              className="rounded-2xl object-cover absolute inset-0 w-full h-full"
              src={`${place.photos?.[0]}`}
              alt={place.title}
              onLoad={handleImageLoad}
            />
          </div>
        </div>
      )}
      {!isLoading && ( // Only render the text when the image has loaded
        <div className="mt-2 ">
          <h2 className="font-bold">{place.address}</h2>
          <h3 className="text-sm truncate text-gray">{place.title}</h3>
          <div className="mt-1">
            <span className="font-bold">${place.price}</span> per night
          </div>
        </div>
      )}
    </Link>
  );
};

export default PlaceBox;
