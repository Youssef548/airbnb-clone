import React from "react";

import { Header } from "../../components";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="p-4 flex flex-col min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
