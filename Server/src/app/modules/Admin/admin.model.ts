import { Schema, model } from "mongoose";
import { ADMIN_ROLES } from "./admin.constant";
import { TAdminUser } from "./admin.interface";

const adminUserSchema = new Schema<TAdminUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never returned by default queries; services opt in with .select("+passwordHash")
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ADMIN_ROLES, default: "owner" },
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
    failedLoginCount: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

export const AdminUserModel = model<TAdminUser>("AdminUser", adminUserSchema);
