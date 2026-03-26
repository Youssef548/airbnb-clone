# Client-Side Security Fixes

## 1. Move Token from localStorage to httpOnly Cookie

**Problem:** JWT stored in `localStorage` is vulnerable to XSS attacks. Any injected script can steal the token.

**This requires changes on both client and server.**

### Server changes:

**File:** `server/src/services/auth.service.ts`

```typescript
// Instead of returning token in JSON response body,
// set it as an httpOnly cookie in the controller.
```

**File:** `server/src/controllers/auth.controller.ts`

```typescript
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await loginService(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour, matches JWT expiry
      path: "/",
    });

    res.status(200).json({ data: user, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await registerService(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({ data: user, message: "Registration successful" });
  } catch (error) {
    next(error);
  }
};

// Add logout endpoint
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "Logged out" });
};
```

**File:** `server/src/middleware/auth.middleware.ts`

```typescript
// Read token from cookie instead of Authorization header
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token; // from cookie

  if (!token) {
    return next(errorHandler(401, "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(errorHandler(401, "Invalid or expired token"));
  }
};
```

**Install cookie-parser:**

```bash
cd server
pnpm add cookie-parser
pnpm add -D @types/cookie-parser
```

**File:** `server/src/app.ts`

```typescript
import cookieParser from "cookie-parser";

app.use(cookieParser());

// Update CORS to allow credentials
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // IMPORTANT
  })
);
```

### Client changes:

**File:** `client/src/store/useStore.ts`

```typescript
// Remove token from localStorage
// Only store user info (non-sensitive)

interface UserStore {
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
    }),
    {
      name: "user-store",
      // Don't persist sensitive data
    }
  )
);
```

**File:** `client/src/providers/AxiosInstance.tsx`

```typescript
// Remove Authorization header injection
// Cookies are sent automatically with credentials: true

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Send cookies automatically
});

// Remove the request interceptor that adds Authorization header
```

---

## 2. Sanitize User-Generated Content

**Problem:** Listing descriptions and other user content rendered without sanitization.

**Install:**

```bash
cd client
pnpm add dompurify
pnpm add -D @types/dompurify
```

**Create:** `client/src/utils/sanitize.ts`

```typescript
import DOMPurify from "dompurify";

export const sanitize = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip ALL HTML tags (plain text only)
    ALLOWED_ATTR: [],
  });
};

// If you want to allow basic formatting:
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  });
};
```

**File:** `client/src/components/Listings/ListingInfo.tsx` (line 51, 70)

```typescript
import { sanitize } from "../../utils/sanitize";

// BEFORE
<p>{listing.description}</p>

// AFTER
<p>{sanitize(listing.description)}</p>
```

---

## 3. Fix OAuth Callback Security

**File:** `client/src/pages/Auth/OAuthCallback.tsx`

**Problem:** Parsing untrusted data from URL params with `JSON.parse(decodeURIComponent(...))`.

**Fix (if keeping URL-based approach temporarily):**

```typescript
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useUserStore();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const userStr = params.get("user");

      if (!userStr) {
        throw new Error("Missing user data");
      }

      // Validate parsed data has expected shape
      const parsed = JSON.parse(decodeURIComponent(userStr));

      if (!parsed._id || !parsed.email || !parsed.role) {
        throw new Error("Invalid user data");
      }

      const user: UserType = {
        _id: String(parsed._id),
        username: String(parsed.username || ""),
        email: String(parsed.email),
        role: parsed.role === "host" ? "host" : "guest",
        favoriteListingsIds: Array.isArray(parsed.favoriteListingsIds)
          ? parsed.favoriteListingsIds.map(String)
          : [],
      };

      setCurrentUser(user);

      // Clear URL params immediately
      window.history.replaceState({}, "", "/");
      navigate("/");
    } catch {
      navigate("/");
    }
  }, []);

  return <div>Authenticating...</div>;
};
```

**Better fix (code exchange pattern):** See `01-critical-security.md` section 2.

---

## 4. Strengthen ProtectedRoute

**File:** `client/src/components/ProtectedRoute.tsx`

**Problem:** Only checks if user object exists, not if auth is valid.

**Fix:**

```typescript
import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../store/useStore";
import { useEffect, useState } from "react";
import axiosInstance from "../providers/AxiosInstance";

const ProtectedRoute = () => {
  const { currentUser, logout } = useUserStore();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      if (!currentUser) {
        setIsValidating(false);
        return;
      }

      try {
        // Add a /api/auth/me endpoint on server
        await axiosInstance.get("/auth/me");
        setIsValid(true);
      } catch {
        logout();
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, [currentUser]);

  if (isValidating) return <div>Loading...</div>;
  if (!isValid) return <Navigate to="/" replace />;

  return <Outlet />;
};
```

**Server - add `/auth/me` route:**

```typescript
// server/src/routes/authRoutes.ts
router.get("/me", isAuth, getCurrentUser);

// server/src/controllers/auth.controller.ts
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user!.userId).select("-password");
    if (!user) return next(errorHandler(404, "User not found"));
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};
```

---

## 5. Add Client-Side Input Validation

**File:** `client/src/components/Modals/RentModal.tsx`

Add bounds validation for numeric inputs:

```typescript
// Add Zod validation for rent form
import { z } from "zod";

const rentFormSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().min(1).max(100000),
  roomCount: z.number().min(1).max(50),
  bathRoomCount: z.number().min(1).max(50),
  guestCount: z.number().min(1).max(100),
  category: z.string().min(1),
  imageSrc: z.string().url(),
});
```

---

## 6. Remove Hardcoded Backend URL

**File:** `client/src/apis/baseurl.ts`

```typescript
// BEFORE
export const BASE_URL = "http://localhost:3000/api";

// AFTER
export const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
```

Ensure all API calls use the configured axios instance rather than importing `BASE_URL` directly.
