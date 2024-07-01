import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";
import ToasterProvider from "./providers/ToasterProvider";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./components/Layout";
const routes = [
  {
    path: '/',
    element: <Layout  />,
    children: [
      {
        index: true, // This denotes the default child route
        element: <Home />,
      },
      {
        path: "/*",
        element: <NotFound />,
      },
    ],
  }
]

const App = () => {
  return (
    <>
      <ToasterProvider />
      <RouterProvider router={createBrowserRouter(routes)} />
    </>
  );
};

export default App;
