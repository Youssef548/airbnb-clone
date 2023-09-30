import React, { useEffect, useState, Suspense } from "react";
import { GetPlaces } from "../utils/Routes";
import { Link } from "react-router-dom";
import axios from "axios";
import Skeleton from "../components/Skeleton/Skeleton";

import PlaceBox from "../components/PlaceBox/PlaceBox";

const IndexPage = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Set initial loading state to true

  useEffect(() => {
    axios
      .get(GetPlaces)
      .then((res) => {
        setPlaces([...res.data]);
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false); // Set loading state to false after a delay
        }, 1000); // Adjust the delay time (in milliseconds) as needed
      });
  }, []);

  // Function to handle image load
  const handleImageLoad = () => {
    setIsLoading(false); // Set loading state to false when the image has loaded
  };

  return (
    <div className="mt-8 gap-x-6 gap-y-4 sm:gap-y-6 md:gap-y-12 lg:gap-y-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-16">
      {places.length > 0 &&
        places.map((place, index) => {
          return (
            <PlaceBox
              key={place._id}
              place={place}
              isLoading={isLoading}
              handleImageLoad={handleImageLoad}
            />
          );
        })}
    </div>
  );
};

export default IndexPage;
