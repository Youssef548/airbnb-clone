import React from "react";

const Skeleton = ({ height, rows, className }) => {
  const containerStyle = {
    paddingBottom: "100%", // 1:1 aspect ratio (square)
  };

  return (
    <div className="skeleton  rounded-md overflow-hidden animate-pulse">
      <div className={` ${className} `} style={containerStyle}></div>
      {rows && (
        <>
          <div className="h-4 my-1 w-1/2 rounded-md bg-[#e0e0e0]"></div>
          <div className="h-4 my-1 w-1/3 rounded-md bg-[#e0e0e0]"></div>
          <div className="h-4 my-1 w-1/4 rounded-md bg-[#e0e0e0]"></div>
          <div className="h-4 my-1 w-1/4 rounded-md bg-[#e0e0e0]"></div>
        </>
      )}
    </div>
  );
};

export default Skeleton;
