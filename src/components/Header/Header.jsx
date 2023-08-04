import React, { useState } from "react";
import { CiPaperplane } from "react-icons/ci";
import { AiOutlineSearch } from "react-icons/ai";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { Link } from "react-router-dom";

const Header = () => {
  const [active, setActive] = useState(false);
  const loginActiveHandler = () => {
    setActive((state) => !state);
  };

  return (
    //className="flex flex-col min-h-screen max-w-4xl mx-auto  py-4 px-8"
    <div>
      <header className="p-4 flex justify-between ">
        <a href="" className="flex items-center gap-1">
          <CiPaperplane className="logo cursor-pointer w-8 h-8 -rotate-90" />
          <span className="font-bold text-xl">aribnb</span>
        </a>

        <div className="flex border border-gray-300 rounded-full py-2 px-4 gap-4 items-center shadow-md shadow-gray-300">
          <div className="cursor-pointer">Anywhere</div>
          <div className=" border-l border-gray-300  h-full"></div>
          <div className="cursor-pointer ">Anyweek</div>
          <div className=" border-l border-gray-300 h-full"></div>
          <div className="cursor-pointer">Addguests</div>
          <button className="bg-primary text-white p-2 rounded-full w-8 h-8">
            <AiOutlineSearch className="w-4 h-4 cursor-pointer" />
          </button>
        </div>

        <Link
          to={"/login"}
          className="flex border border-gray-300 rounded-full py-2 px-4 gap-4 items-center cursor-pointer"
          onClick={() => loginActiveHandler()}
        >
          <RxHamburgerMenu className="w-6 h-6 cursor-pointer" />
          <CgProfile className="w-6 h-6 cursor-pointer bg-gray-300 rounded-full" />
        </Link>
      </header>
    </div>
  );
};

export default Header;
