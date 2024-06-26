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
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;
