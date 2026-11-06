export const ADMIN_ROLES = ["owner", "editor"] as const;

// Account lockout: after MAX_FAILED_LOGINS wrong passwords the account is
// locked for LOCK_MINUTES, regardless of which IP the attempts come from.
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

export const BCRYPT_ROUNDS = 12;

export const PASSWORD_MIN_LENGTH = 12;
