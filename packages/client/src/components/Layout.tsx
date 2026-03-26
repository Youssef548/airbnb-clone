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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-rose-500 focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Suspense fallback={<Loading />}>
          <SearchModal />
          <LoginModal />
          <RentModal />
          <RegisterModal />
          <Navbar user={user} />
          <main id="main-content">
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </main>
        </Suspense>
      </div>
    </>
  );
}

export default Layout;
