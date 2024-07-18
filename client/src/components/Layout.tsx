import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./layouts/Navbar/Navbar";
import RegisterModal from "./Modals/RegisterModal";
import LoginModal from "./Modals/LoginModal";
import useUserStore from "../store/useStore";
import RentModal from "./Modals/RentModal";
import SearchModal from "./Modals/SearchModal";
import Loading from "./Loading";
function Layout() {
  const user = useUserStore((state) => state.user);

  return (
    <>
      <div>
        <Suspense fallback={<Loading />}>
          <SearchModal />
          <LoginModal />
          <RentModal />
          <RegisterModal />
          <Navbar user={user} />
          <Outlet />
        </Suspense>
      </div>
    </>
  );
}

export default Layout;
