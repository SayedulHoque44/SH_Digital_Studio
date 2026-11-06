import { Types } from "mongoose";
import { ADMIN_ROLES } from "./admin.constant";

export type TAdminRole = (typeof ADMIN_ROLES)[number];

export type TAdminUser = {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: TAdminRole;
  isActive: boolean;
  // Incremented on password change / "sign out everywhere"; sessions issued
  // with an older version are rejected by the auth middleware.
  tokenVersion: number;
  failedLoginCount: number;
  lockUntil?: Date | null;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

// Shape attached to `req.admin` by the auth middleware
export type TAuthAdmin = {
  id: string;
  name: string;
  email: string;
  role: TAdminRole;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
