import { Link } from "react-router-dom";
import "./NotFound.css"; // Import your custom styles for the NotFound component

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404 - Page Not Found</h1>
        <p className="not-found-message">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="not-found-link">
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
