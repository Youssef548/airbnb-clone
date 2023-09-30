import { Link } from "react-router-dom";

import Profile from "./Profile";
import Search from "./Search";

const Header = () => {
  return (
    //className="flex flex-col min-h-screen max-w-4xl mx-auto  py-4 px-8"
    <div className="border-b border-gray-200">
      <div className="sm:containers px-4 sm:px-6 md:px-12 lg:px-16">
        <header className="p-4 flex  justify-between ">
          <Link to="/" className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="logo cursor-pointer w-8 h-8 -rotate-90 text-2xl"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>

            <span className="font-bold text-2xl text-primary font-poppins">
              airbnb
            </span>
          </Link>
          <Search />
          <Profile />
        </header>
      </div>
    </div>
  );
};

export default Header;
