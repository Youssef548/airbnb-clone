import React, { useState, useContext } from "react";
import { CiPaperplane } from "react-icons/ci";
import { AiOutlineSearch } from "react-icons/ai";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { TbWorld } from "react-icons/tb";
import { Link } from "react-router-dom";
import { UserContext } from "../../store/UserContext";

import RegisterModal from "../Modals/RegisterModal";
import LoginModal from "../Modals/LoginModal";

const Header = () => {
  const [profileToggler, setProfileToggler] = useState(false);
  const profileTogglerHandler = () => {
    setProfileToggler(!profileToggler);
  };

  const { user } = useContext(UserContext);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };
  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };
  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    //className="flex flex-col min-h-screen max-w-4xl mx-auto  py-4 px-8"
    <div className="border-b border-gray-200">
      <div className="containers px-16">
        <header className="p-4 flex justify-center sm:justify-between ">
          <Link to="/" className="hidden md:flex items-center gap-1">
            <CiPaperplane className="logo cursor-pointer w-8 h-8 -rotate-90 text-2xl" />
            <span className="font-bold text-2xl text-primary font-poppins">
              airbnb
            </span>
          </Link>

          <div className=" cursor-pointer flex border border-gray-300 rounded-full py-2 px-4 gap-4 items-center shadow-md transition-all duration-300 shadow-gray-200 hover:shadow-gray-300">
            <div className="cursor-pointer">Anywhere</div>
            <div className=" border-l border-gray-300  h-full"></div>
            <div className="cursor-pointer ">Anyweek</div>
            <div className=" border-l border-gray-300 h-full"></div>
            <div className="cursor-pointer">Addguests</div>
            <button className="bg-primary text-white p-2 rounded-full w-8 h-8">
              <AiOutlineSearch className="w-4 h-4 cursor-pointer" />
            </button>
          </div>

          <nav className="flex relative  items-center gap-6">
            <p className="cursor-pointer hover:bg-gray-100 p-4 rounded-full transition-all duration-300">
              <TbWorld className="text-2xl" />
            </p>

            <div
              // to={user ? "/account" : "/login"}
              className="relative hidden sm:flex border   border-gray-300 rounded-full py-2 px-2 md:px-4 gap-4 items-center cursor-pointer shadow-lg hover:shadow-gray-500 transition-all duration-300"
              onClick={profileTogglerHandler}
            >
              <RxHamburgerMenu className="hidden md:block md:w-6 md:h-6 cursor-pointer" />
              <CgProfile className="w-6 h-6 cursor-pointer bg-gray-300 rounded-full " />
              {!!user && <div>{user.name}</div>}
            </div>
            {profileToggler && (
              <nav className="absolute top-[60px] right-0 flex flex-col w-48  bg-gray-300 py-4 list-none rounded-md text-black-500">
                <li
                  onClick={openRegisterModal}
                  className="p-3 cursor-pointer hover:bg-white transition-all duration-300 text-sm text-black-900 font-bold"
                >
                  Sign up
                  <RegisterModal
                    isOpen={showRegisterModal}
                    onClose={closeRegisterModal}
                  />
                </li>


                <li
                  onClick={openLoginModal}
                  className="p-3 cursor-pointer hover:bg-white transition-all duration-300 text-sm text-black-900 font-bold"
                >
                  Login
                  <LoginModal
                    isOpen={showLoginModal}
                    onClose={closeLoginModal}
                  />
                </li>
    
                <div className="break h-[1px] w-full bg-red-300 my-2 cursor-default"></div>
                <li className="p-3 hover:bg-white transition-all duration-300 text-sm">
                  Airbnb your home
                </li>
                <Link className="p-3 hover:bg-white transition-all duration-300 text-sm">
                  Help center
                </Link>
              </nav>
            )}
          </nav>
        </header>
      </div>
    </div>
  );
};

export default Header;
