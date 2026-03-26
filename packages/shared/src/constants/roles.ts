export const ROLES = {
  GUEST: "guest",
  HOST: "host",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
