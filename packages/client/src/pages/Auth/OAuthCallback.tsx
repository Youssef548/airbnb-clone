import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import useUserStore from "../../store/useStore";
import { exchangeOAuthCode } from "../../apis/auth/auth";

/**
 * OAuth Callback Page
 * Handles the redirect from backend after OAuth authentication.
 * Exchanges the short-lived code for an httpOnly cookie via POST.
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      toast.error("Authentication failed. Please try again.");
      navigate("/", { replace: true });
      return;
    }

    const exchange = async () => {
      try {
        const res = await exchangeOAuthCode(code);
        setUser(res.data.currentUser);
        toast.success("Successfully logged in!");

        // Clear URL params
        window.history.replaceState({}, "", "/");
        navigate("/", { replace: true });
      } catch {
        toast.error("Authentication failed. Please try again.");
        navigate("/", { replace: true });
      }
    };

    exchange();
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
