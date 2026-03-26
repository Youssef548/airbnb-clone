# Critical Security Fixes

## 1. Fix Broken CORS Configuration

**File:** `server/src/app.ts` (lines 20-35)

**Problem:** `ALLOWED_ORIGINS` is a JSON string checked with `string.includes()` instead of parsed as an array. Any origin containing the substring can bypass CORS.

**Fix:**

```typescript
// server/src/app.ts
const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? JSON.parse(process.env.ALLOWED_ORIGINS)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
```

Also update `server/.env.example`:

```
ALLOWED_ORIGINS=["http://localhost:5173"]
```

---

## 2. Fix JWT Token Exposed in OAuth URL

**File:** `server/src/controllers/oauth.controller.ts` (line 70)

**Problem:** JWT is passed as a URL query parameter during OAuth redirect. Tokens leak via browser history, referrer headers, and server logs.

**Fix (Option A - httpOnly cookie):**

```typescript
// server/src/controllers/oauth.controller.ts
export const oauthCallback = async (req: Request, res: Response) => {
  // ... existing user/token logic ...

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  const redirectUrl = `${CLIENT_URL}/auth/callback?user=${encodeURIComponent(
    JSON.stringify(sanitizedUser)
  )}`;
  res.redirect(redirectUrl);
};
```

**Fix (Option B - short-lived code exchange):**

```typescript
// 1. Store token in a temporary map with a random code
import crypto from "crypto";

const pendingTokens = new Map<string, { token: string; expiresAt: number }>();

export const oauthCallback = async (req: Request, res: Response) => {
  // ... existing user/token logic ...

  const code = crypto.randomBytes(32).toString("hex");
  pendingTokens.set(code, {
    token,
    expiresAt: Date.now() + 60_000, // 1 minute
  });

  res.redirect(`${CLIENT_URL}/auth/callback?code=${code}`);
};

// 2. Add a new route to exchange code for token
export const exchangeCode = async (req: Request, res: Response) => {
  const { code } = req.body;
  const entry = pendingTokens.get(code);

  if (!entry || entry.expiresAt < Date.now()) {
    pendingTokens.delete(code);
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  pendingTokens.delete(code);
  res.json({ token: entry.token });
};
```

Then update the client `OAuthCallback.tsx` to POST the code and receive the token in a response body instead of reading it from the URL.

---

## 3. Fix JWT Payload Inconsistency (Missing Role)

**File:** `server/src/services/auth.service.ts` (lines 32-35)

**Problem:** Traditional login JWT omits `role`. OAuth JWT includes it. `authorizeRoles` middleware will break for traditional auth users.

**Fix:**

```typescript
// server/src/services/auth.service.ts - loginService function
const token = jwt.sign(
  {
    userId: user._id,
    role: user.role, // ADD THIS LINE
  },
  JWT_SECRET,
  { expiresIn: "1h" }
);
```

---

## 4. Add Helmet Middleware

**Install:**

```bash
cd server
pnpm add helmet
```

**File:** `server/src/app.ts`

```typescript
import helmet from "helmet";

const app = express();

// Add as first middleware
app.use(helmet());
```

---

## 5. Add Rate Limiting

**Install:**

```bash
cd server
pnpm add express-rate-limit
```

**File:** `server/src/app.ts` or create `server/src/middleware/rateLimiter.ts`

```typescript
import rateLimit from "express-rate-limit";

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please try again later." },
});
```

Apply in routes:

```typescript
// server/src/routes/authRoutes.ts
import { authLimiter } from "../middleware/rateLimiter";

router.post("/register", authLimiter, validateSchema(registerSchema), register);
router.post("/login", authLimiter, validateSchema(loginSchema), login);
```

---

## 6. Fix Weak Password Requirements

**File:** `server/src/schemas/userSchema.ts` (lines 5-7)

**Fix:**

```typescript
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
```

---

## 7. Fix Insecure OAuth Random Password

**File:** `server/src/config/passport.ts` (lines 63, 120)

**Problem:** Uses `Math.random().toString(36).slice(-8)` which is cryptographically weak.

**Fix:**

```typescript
import crypto from "crypto";

// Replace Math.random password generation with:
password: crypto.randomBytes(32).toString("hex"),
```

Better alternative - set password to `null` and update User model to allow nullable passwords for OAuth users:

```typescript
// In passport strategy callback:
const newUser = new User({
  // ...other fields
  password: null, // OAuth users don't need passwords
});
```

Then update login to reject null-password users from password-based login.
