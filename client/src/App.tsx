import { lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ToasterProvider from "./providers/ToasterProvider";
import Layout from "./components/Layout";

// Use React.lazy for dynamic imports
const Home = lazy(() => import("./pages/Home/Home"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const ListingPage = lazy(() => import("./pages/Listings/Listing"));
const TripsPage = lazy(() => import("./pages/Trips/TripsPage"));
const ReservationsPage = lazy(
  () => import("./pages/Reservations/Reservations")
);
const FavoritesPage = lazy(() => import("./pages/Favorites/Favorites"));
const PropertiesPage = lazy(() => import("./pages/Properties/PropertiesPage"));

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
        path: "/properties",
        element: <PropertiesPage />,
      },
      {
        path: "/reservations",
        element: <ReservationsPage />,
      },
      {
        path: "/favorites",
        element: <FavoritesPage />,
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
