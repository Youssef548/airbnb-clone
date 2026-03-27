import { lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ToasterProvider from "./providers/ToasterProvider";
import QueryProvider from "./providers/QueryProvider";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

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
const OAuthCallback = lazy(() => import("./pages/Auth/OAuthCallback"));
const OAuthError = lazy(() => import("./pages/Auth/OAuthError"));

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
        path: "listing/:listingId",
        element: <ListingPage />,
      },
      {
        path: "/auth/callback",
        element: <OAuthCallback />,
      },
      {
        path: "/auth/error",
        element: <OAuthError />,
      },
      {
        path: "/*",
        element: <NotFound />,
      },
      {
        element: <ProtectedRoute />, // Protected routes are nested here
        children: [
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
        ],
      },
    ],
  },
];

const App = () => {
  return (
    <QueryProvider>
      <ToasterProvider />
      <RouterProvider
        router={createBrowserRouter(routes, { basename: "/projects/airbnb" })}
      />
    </QueryProvider>
  );
};

export default App;
