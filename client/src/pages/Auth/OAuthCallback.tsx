import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { setAuthToken } from "../../utils/authUtils";
import useUserStore from "../../store/useStore";

/**
 * OAuth Callback Page
 * Handles the redirect from backend after OAuth authentication
 * Extracts token and user data from URL params and stores them
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        // Parse user data from URL
        const user = JSON.parse(decodeURIComponent(userStr));

        // Store token in localStorage
        setAuthToken(token);

        // Update user state in Zustand store
        setUser(user);

        // Show success message
        toast.success("Successfully logged in!");

        // Redirect to home page
        navigate("/", { replace: true });
      } catch {
        toast.error("Authentication failed. Please try again.");
        navigate("/", { replace: true });
      }
    } else {
      // No token or user data found
      toast.error("Authentication failed. Please try again.");
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
