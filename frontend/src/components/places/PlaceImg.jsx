import React from "react";

const PlaceImg = ({ place, index = 0, className = null }) => {
  if (!place.photos?.length) {
    return "";
  }

  if (!className) className = "object-cover";

  return (
    <img
      loading="lazy"
      className={className}
      //   src={"http://localhost:3000/uploads/" + place.photos[0]}
      src={`${place.photos[index]}`}
    ></img>
  );
};

export default PlaceImg;
