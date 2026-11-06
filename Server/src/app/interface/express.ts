import { TAuthAdmin } from "../modules/Admin/admin.interface";

// Adds the authenticated admin (set by the auth middleware) to Express'
// Request type. This is a regular .ts module (imported by app.ts and the auth
// middleware) so both `tsc` and ts-node-dev pick the augmentation up.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: TAuthAdmin;
    }
  }
}

export {};
