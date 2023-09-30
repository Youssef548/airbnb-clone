import React, { useState, useContext, useEffect, useRef } from "react";
import useRegisterModal from "../../hooks/useRegisterModal";
import useLoginModal from "../../hooks/useLoginModal";
import LoginModal from "../Modals/LoginModal";
import RegisterModal from "../Modals/RegisterModal";
import axios from "axios";
import { LogoutRoute } from "../../utils/Routes";
import { UserContext } from "../../store/UserContext";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import makeReq from "../../libs/axiosInstance";

const Profile = () => {
  const [profileToggler, setProfileToggler] = useState(false);

  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const toastOptions = { position: toast.POSITION.BOTTOM_RIGHT };

  const toggleMenu = () => {
    setProfileToggler((prev) => !prev);
  };

  const { user, setUser } = useContext(UserContext);

  const openRegisterModal = () => {
    registerModal.onOpen();
  };

  const closeRegisterModal = () => {
    registerModal.onClose();
  };

  const openLoginModal = () => {
    loginModal.onOpen();
  };

  const closeLoginModal = () => {
    loginModal.onClose();
  };

  const logoutHandler = async () => {
    try {
      // Make the logout request
      await makeReq.post(LogoutRoute);
      setUser(null);
      toast.success("Logout successful", toastOptions);
    } catch (err) {
      console.log(err);

      toast.error(err.response.data.error, toastOptions);
    }
  };

  // Close the profile menu when clicking outside of it
  useEffect(() => {
    const handleBodyClick = (e) => {
      if (profileToggler && e.target.closest(".profile-menu") === null) {
        setProfileToggler(false);
      }
    };

    document.body.addEventListener("click", handleBodyClick);

    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, [profileToggler]);

  const modalContainerRef = useRef(null);

  // Prevent modal from closing when clicking inside
  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent the click event from propagating to the body click event
  };

  return (
    <nav
      className={`flex relative items-center gap-6 ${
        profileToggler ? "" : "z-[999]"
      } z-10`}
    >
      <div
        className="hidden sm:flex border border-gray-300 rounded-full py-2 px-2 md:px-4 gap-4 items-center cursor-pointer shadow-sm hover:shadow-md profile-menu"
        onClick={toggleMenu}
      >
        <svg
          className="profile w-6 h-6 cursor-pointer rounded-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        {!!user && <div>{user.name}</div>}
      </div>
      {profileToggler && (
        <nav
          className="absolute top-[60px] -right-16 flex flex-col gap-2 w-48 bg-white py-4 list-none border shadow-md hover:shadow-lg rounded-md text-black-500 profile-menu"
          ref={modalContainerRef} // Add a ref to the modal container
          onClick={handleModalClick} // Attach the click event handler to the modal container
        >
          {!user && (
            <>
              <li
                onClick={openRegisterModal}
                className="p-3 cursor-pointer hover:bg-gray-100 transition-all duration-300 text-sm text-black-900 font-bold"
              >
                Sign up
                <RegisterModal onClose={closeRegisterModal} />
              </li>

              <li
                onClick={openLoginModal}
                className="p-3 cursor-pointer hover:bg-gray-100  transition-all duration-300 text-sm text-black-900 font-bold"
              >
                Login
                <LoginModal onClose={closeLoginModal} />
              </li>
            </>
          )}
          {user && (
            <>
              <Link
                className="p-3 cursor-pointer hover:bg-gray-100  transition-all duration-300 text-sm"
                to={"/account"}
              >
                Account
              </Link>

              <li
                onClick={logoutHandler}
                className="p-3  cursor-pointer font-bold hover:bg-gray-100  transition-all duration-300 text-sm"
              >
                Logout
              </li>
            </>
          )}
        </nav>
      )}

      <ToastContainer />
    </nav>
  );
};

export default Profile;
