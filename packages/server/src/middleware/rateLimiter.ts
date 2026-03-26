import rateLimit from "express-rate-limit";

const isE2E = process.env.E2E_TESTING === "true";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isE2E ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});
