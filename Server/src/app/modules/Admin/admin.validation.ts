import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "./admin.constant";

export const strongPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(128, "Password is too long")
  .refine(value => /[a-zA-Z]/.test(value) && /\d/.test(value), {
    message: "Password must contain both letters and numbers",
  });

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
    password: z.string().min(1, "Password is required").max(128),
  }),
});

const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required").max(128),
      newPassword: strongPassword,
    })
    .refine(data => data.currentPassword !== data.newPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    }),
});

const updateMeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
  }),
});

export const AdminValidations = {
  loginSchema,
  changePasswordSchema,
  updateMeSchema,
};
