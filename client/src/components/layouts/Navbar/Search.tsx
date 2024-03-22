import React from "react";

const Search = () => {
  return (
    <div
      className="
  w-full
  border-[1px]
  md:w-auto
  py-2
  rounded-full
  shadow-sm
  transition
  cursor-pointer
  hover:shadow-md
  "
    >
      <div
        className="
    flex
    flex-row
    items-center
    justify-between
    "
      >
        <div
          className="
    text-sm
    font-semibold
    px-6
    "
        >
          Anywhere
        </div>
        <div
          className="
        hidden
        sm:block
        text-sm
        font-semibold
        px-6
        border-x-[1px]
        flex-1
        text-center
        "
        >
          Any Week
        </div>
        <div className="text-sm pl-6 pr-2 text-gray-600 flex flex-row items-center gap-3">
          <div className="hidden sm:block">Add Guests</div>
          <div className="p-2 bg-rose-500 rounded-full text-white">
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
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
