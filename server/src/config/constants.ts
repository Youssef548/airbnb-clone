export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const AUTH = {
  JWT_EXPIRY: "1h",
  SALT_ROUNDS: 10,
} as const;

export const ROLES = {
  GUEST: "guest",
  HOST: "host",
} as const;
