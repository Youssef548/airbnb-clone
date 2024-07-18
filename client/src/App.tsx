import { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ToasterProvider from "./providers/ToasterProvider";
import Layout from "./components/Layout";
import Loading from "./components/Loading";

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
        element: (
          <Suspense fallback={<Loading />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/listing/:listingId",
        element: (
          <Suspense fallback={<Loading />}>
            <ListingPage />
          </Suspense>
        ),
      },
      {
        path: "/trips",
        element: (
          <Suspense fallback={<Loading />}>
            <TripsPage />
          </Suspense>
        ),
      },
      {
        path: "/properties",
        element: (
          <Suspense fallback={<Loading />}>
            <PropertiesPage />
          </Suspense>
        ),
      },
      {
        path: "/reservations",
        element: (
          <Suspense fallback={<Loading />}>
            <ReservationsPage />
          </Suspense>
        ),
      },
      {
        path: "/favorites",
        element: (
          <Suspense fallback={<Loading />}>
            <FavoritesPage />
          </Suspense>
        ),
      },
      {
        path: "/*",
        element: (
          <Suspense fallback={<Loading />}>
            <NotFound />
          </Suspense>
        ),
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
