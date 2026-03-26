import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * OAuth Error Page
 * Handles OAuth authentication failures
 */
const OAuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message") || "Authentication failed. Please try again.";

    // Show error message
    toast.error(message);

    // Redirect to home page after 2 seconds
    const timeout = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-rose-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Failed</h1>
        <p className="text-gray-600">Redirecting you back...</p>
      </div>
    </div>
  );
};

export default OAuthError;
