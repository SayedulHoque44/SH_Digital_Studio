import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { BCRYPT_ROUNDS, LOCK_MINUTES, MAX_FAILED_LOGINS } from "./admin.constant";
import {
  TAdminRole,
  TChangePasswordPayload,
  TLoginPayload,
} from "./admin.interface";
import { AdminUserModel } from "./admin.model";
import { signSessionToken, toAuthAdmin } from "./admin.utils";

// A real hash (same cost factor) compared against when the email does not
// exist, so response times do not reveal which emails have accounts. Created
// lazily to keep cold starts fast.
let dummyHashPromise: Promise<string> | null = null;
const getDummyHash = () => {
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash("timing-equaliser-not-a-password", BCRYPT_ROUNDS);
  }
  return dummyHashPromise;
};

const INVALID_CREDENTIALS = "Invalid email or password";

const login = async (payload: TLoginPayload) => {
  const admin = await AdminUserModel.findOne({ email: payload.email }).select(
    "+passwordHash",
  );

  if (!admin) {
    await bcrypt.compare(payload.password, await getDummyHash());
    throw new AppError(httpStatus.UNAUTHORIZED, INVALID_CREDENTIALS);
  }

  if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
    throw new AppError(
      httpStatus.TOO_MANY_REQUESTS,
      `Too many failed attempts. This account is locked for up to ${LOCK_MINUTES} minutes.`,
    );
  }

  const passwordMatches = await bcrypt.compare(
    payload.password,
    admin.passwordHash,
  );

  if (!passwordMatches) {
    const failedLoginCount = (admin.failedLoginCount || 0) + 1;
    const shouldLock = failedLoginCount >= MAX_FAILED_LOGINS;
    await AdminUserModel.updateOne(
      { _id: admin._id },
      {
        failedLoginCount: shouldLock ? 0 : failedLoginCount,
        lockUntil: shouldLock
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
          : null,
      },
    );
    throw new AppError(httpStatus.UNAUTHORIZED, INVALID_CREDENTIALS);
  }

  // Checked after the password so a disabled account is not distinguishable
  // from a wrong password for someone who does not know the password.
  if (!admin.isActive) {
    throw new AppError(httpStatus.FORBIDDEN, "This account is disabled");
  }

  admin.failedLoginCount = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = new Date();
  await admin.save();

  return { token: signSessionToken(admin), admin: toAuthAdmin(admin) };
};

const getMe = async (adminId: string) => {
  const admin = await AdminUserModel.findById(adminId);
  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Account not found");
  }
  return toAuthAdmin(admin);
};

const updateMe = async (adminId: string, payload: { name: string }) => {
  const admin = await AdminUserModel.findByIdAndUpdate(
    adminId,
    { name: payload.name },
    { new: true, runValidators: true },
  );
  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Account not found");
  }
  return toAuthAdmin(admin);
};

const changePassword = async (
  adminId: string,
  payload: TChangePasswordPayload,
) => {
  const admin = await AdminUserModel.findById(adminId).select("+passwordHash");
  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Account not found");
  }

  const matches = await bcrypt.compare(
    payload.currentPassword,
    admin.passwordHash,
  );
  if (!matches) {
    throw new AppError(httpStatus.BAD_REQUEST, "Current password is incorrect");
  }

  admin.passwordHash = await bcrypt.hash(payload.newPassword, BCRYPT_ROUNDS);
  admin.passwordChangedAt = new Date();
  // Invalidates every other session; the caller receives a fresh token.
  admin.tokenVersion = (admin.tokenVersion || 0) + 1;
  await admin.save();

  return { token: signSessionToken(admin), admin: toAuthAdmin(admin) };
};

const logoutEverywhere = async (adminId: string) => {
  await AdminUserModel.updateOne({ _id: adminId }, { $inc: { tokenVersion: 1 } });
};

// Used by the bootstrap script (scripts/createAdmin.ts) only - there is
// deliberately no HTTP endpoint for creating admin accounts.
const createAdmin = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: TAdminRole;
}) => {
  const passwordHash = await bcrypt.hash(payload.password, BCRYPT_ROUNDS);
  return AdminUserModel.create({
    name: payload.name,
    email: payload.email.toLowerCase().trim(),
    passwordHash,
    role: payload.role || "owner",
  });
};

const resetPassword = async (email: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return AdminUserModel.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginCount: 0,
      lockUntil: null,
      isActive: true,
      $inc: { tokenVersion: 1 },
    },
    { new: true },
  );
};

export const AdminServices = {
  login,
  getMe,
  updateMe,
  changePassword,
  logoutEverywhere,
  createAdmin,
  resetPassword,
};
