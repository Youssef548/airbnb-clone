import { Suspense, lazy, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./layouts/Navbar/Navbar";
import useUserStore from "../store/useStore";
import Loading from "./Loading";

const RegisterModal = lazy(() => import("./Modals/RegisterModal"));
const LoginModal = lazy(() => import("./Modals/LoginModal"));
const RentModal = lazy(() => import("./Modals/RentModal"));
const SearchModal = lazy(() => import("./Modals/SearchModal"));

function Layout() {
  const user = useUserStore((state) => state.user);
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <div>
        <Suspense fallback={<Loading />}>
          <SearchModal />
          <LoginModal />
          <RentModal />
          <RegisterModal />
          <Navbar user={user} />
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </Suspense>
      </div>
    </>
  );
}

export default Layout;
