/* eslint-disable no-console */
/**
 * Bootstraps the admin account from environment variables:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase-123' ADMIN_NAME="Your Name" npm run seed:admin
 *
 * (or put the three variables in Server/.env temporarily and remove the
 * password afterwards). The password is hashed with bcrypt before it is
 * stored and is never printed. There is no public registration endpoint.
 *
 * To reset a forgotten password, run again with ADMIN_RESET_PASSWORD=true.
 */
import { connectDatabase, disconnectDatabase } from "../app/config/db";
import { AdminUserModel } from "../app/modules/Admin/admin.model";
import { AdminServices } from "../app/modules/Admin/admin.service";
import { strongPassword } from "../app/modules/Admin/admin.validation";

async function run() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Studio Admin").trim();
  const reset = process.env.ADMIN_RESET_PASSWORD === "true";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to a valid email address");
  }
  const passwordCheck = strongPassword.safeParse(password);
  if (!passwordCheck.success) {
    throw new Error(`ADMIN_PASSWORD is not strong enough: ${passwordCheck.error.issues[0].message}`);
  }

  await connectDatabase();
  const existing = await AdminUserModel.findOne({ email }).lean();

  if (existing && !reset) {
    console.log(`An admin with ${email} already exists. Nothing changed.`);
    console.log("To reset its password run again with ADMIN_RESET_PASSWORD=true.");
    return;
  }

  if (existing && reset) {
    await AdminServices.resetPassword(email, password);
    console.log(`Password reset for ${email}. All existing sessions were signed out.`);
    return;
  }

  await AdminServices.createAdmin({ name, email, password, role: "owner" });
  console.log(`Admin account created for ${email}. Sign in at /admin/login.`);
}

run()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async error => {
    console.error("Could not create admin:", error?.message || error);
    await disconnectDatabase().catch(() => undefined);
    process.exit(1);
  });
