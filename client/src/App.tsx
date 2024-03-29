import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";
import favicon from "./assets/free-airbnb-1869032-1583156.webp"; // Import your favicon file
import ToasterProvider from "./providers/ToasterProvider";
const App = () => {
  return (
    <Router>
      <ToasterProvider />
      <div>
        <Helmet>
          <title>Air bnb</title>
          <meta name="description" content="Air bnb for rent" />
          <meta name="keywords" content="React, Component, Meta Data" />
          <link rel="icon" type="image/webp" href={favicon} />
        </Helmet>
        {/* Define your layout components here */}
        {/* For example: <Header /> */}

        {/* Define your routes using the Switch component */}
        <Routes>
          {/* Route for the Home page */}
          <Route path="/" element={<Home />} />

          {/* Route for a 404 Not Found page */}
          <Route path="/*" element={<NotFound />} />
        </Routes>

        {/* Other layout components like Footer can go here */}
        {/* For example: <Footer /> */}
      </div>
    </Router>
  );
};

export default App;
