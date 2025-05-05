import { useCallback, useState } from "react";
import Avatar from "../../Avatar";
import MenuItem from "./MenuItem";
import useRegisterModal from "../../../hooks/useRegisterModal";
import useLoginModal from "../../../hooks/useLoginModal";
import { UserType } from "../../../types/user";
import { removeAuthToken } from "../../../utils/authUtils";
import useUserStore from "../../../store/useStore";
import useRentModal from "../../../hooks/useRentModal";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  user: UserType | null | undefined;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const userStore = useUserStore(); // Access the store
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const navigate = useNavigate();

  const rentModal = useRentModal();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const onRent = useCallback(() => {
    if (!user) {
      return loginModal.onOpen();
    }

    // open Rent modal

    rentModal.onOpen();
  }, [user, loginModal]);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <div
          onClick={onRent}
          className="
        hidden md:block text-sm font-semibold py-3 px-4 rounded-full 
        transition cursor-pointer hover:bg-neutral-100
        "
        >
          Airbnb your home
        </div>
        <div
          onClick={toggleOpen}
          className="
       p-2
       md:py-1
       md:px-2
       border-[1px]
       border-neutral-200
       flex
       flex-row
       items-center
       gap-3
       rounded-full
       cursor-pointer
       hover:shadow-md
       transition
        "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
          <div className="hidden md:block">
            <Avatar />
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="
        absolute
        rounded-xl
        shadow-md
        w-[40vw]
        md:w-3/4
        bg-white
        overflow-hidden
        right-0
        top-12
        text-sm
        "
        >
          <div className="flex flex-col cursor-pointer">
            {user ? (
              <>
                <MenuItem onClick={() => navigate("/trips")} label="My trips" />
                <MenuItem
                  onClick={() => navigate("/favorites")}
                  label="My favourites"
                />
                {user?.role == "host" && (
                  <MenuItem
                    onClick={() => navigate("/reservations")}
                    label="My Reservations"
                  />
                )}
                {user?.role === "host" && (
                  <MenuItem
                    onClick={() => navigate("/properties")}
                    label="My Properties"
                  />
                )}
                {user?.role === "host" && (
                  <MenuItem onClick={rentModal.onOpen} label="Airbnb my home" />
                )}
                <hr />
                <MenuItem
                  onClick={() => {
                    removeAuthToken();
                    userStore.setUser(null);
                  }}
                  label="Logout"
                />
              </>
            ) : (
              <>
                <MenuItem onClick={loginModal.onOpen} label="Login" />
                <MenuItem onClick={registerModal.onOpen} label="Sign up" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
