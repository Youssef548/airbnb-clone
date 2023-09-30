import React from "react";

const Search = () => {
  return (
    <div className="hidden cursor-pointer md:flex border border-gray-300 rounded-full py-2 px-4 gap-4 items-center shadow-md transition-all duration-300 shadow-gray-200 hover:shadow-gray-300">
      <div className="cursor-pointer">Anywhere</div>
      <div className=" border-l border-gray-300  h-full"></div>
      <div className="cursor-pointer ">Anyweek</div>
      <div className=" border-l border-gray-300 h-full"></div>
      <div className="cursor-pointer">Addguests</div>
    </div>
  );
};

export default Search;
