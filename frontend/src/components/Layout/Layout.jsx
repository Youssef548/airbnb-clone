import React from "react";

import { Header } from "..";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="py-4  flex flex-col min-h-screen ">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
