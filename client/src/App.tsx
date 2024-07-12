import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";
import ToasterProvider from "./providers/ToasterProvider";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./components/Layout";
import ListingPage from "./pages/Listings/Listing";
import TripsPage from "./pages/Trips/TripsPage";
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/listing/:listingId",
        element: <ListingPage />,
      },
      {
        path: "/trips",
        element: <TripsPage />,
      },
      {
        path: "/*",
        element: <NotFound />,
      },
    ],
  },
];

const App = () => {
  return (
    <>
      <ToasterProvider />
      <RouterProvider router={createBrowserRouter(routes)} />
    </>
  );
};

export default App;
