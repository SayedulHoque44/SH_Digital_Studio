import dotenv from "dotenv"; //dotenv
import path from "path"; //node.js buildin mobule

dotenv.config({ path: path.join(process.cwd(), ".env") }); //-->(currentWorkingDirectory+.env)

const node_env = process.env.NODE_ENV || "development";
const isProduction = node_env === "production";

// Comma separated list -> trimmed array without empty entries
const list = (value?: string) =>
  (value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

export default {
  node_env,
  isProduction,
  port: process.env.PORT || 8080,

  // The database name is part of the URI path (.../agency_portfolio?...).
  // MONGODB_DB_NAME is an optional override (used by the API test suite so
  // tests never touch the real content database).
  database_url: process.env.mongoDbUrl,
  database_name: process.env.MONGODB_DB_NAME || undefined,

  // The original variable name contains a typo (SECRCT); it is kept so the
  // existing .env keeps working. JWT_ACCESS_SECRET is accepted as well.
  jwt_access_secret:
    process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRCT,
  admin_session_expires_in: process.env.ADMIN_SESSION_EXPIRES_IN || "8h",
  session_cookie_name: "shds_session",
  // Secure cookies are required in production (HTTPS). Can be forced locally.
  cookie_secure:
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === "true"
      : isProduction,

  // Browser origins allowed to call the API (CORS + CSRF origin check).
  client_origins: list(process.env.CLIENT_ORIGINS).length
    ? list(process.env.CLIENT_ORIGINS)
    : ["http://localhost:3000"],

  // Shared secret the Next.js server sends with server-side data requests so
  // they are not throttled by the per-IP rate limiter. Never expose publicly.
  internal_api_key: process.env.INTERNAL_API_KEY || "",

  // Express "trust proxy" setting (number of proxy hops). Vercel = 1.
  trust_proxy: process.env.TRUST_PROXY || (isProduction ? "1" : "0"),

  aws_s3_bucket_name: process.env.AWS_S3_BUCKET_NAME,
  aws_s3_bucket_region: process.env.AWS_S3_BUCKET_REGION,
  aws_access_key: process.env.AWS_ACCESS_KEY,
  aws_secret_key: process.env.AWS_SECRET_KEY,
  // Uploads are only enabled when the public base URL of the bucket/CDN is
  // known, otherwise uploaded files could not be displayed.
  media_public_base_url: (process.env.MEDIA_PUBLIC_BASE_URL || "").replace(
    /\/+$/,
    "",
  ),
  media_upload_prefix: process.env.MEDIA_UPLOAD_PREFIX || "sh-digital-studio",

  smtp_host: process.env.SMTP_HOST,
  smtp_port: Number(process.env.SMTP_PORT || 587),
  smtp_secure: process.env.SMTP_SECURE === "true",
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  mail_from: process.env.MAIL_FROM,
  inquiry_notify_email: process.env.INQUIRY_NOTIFY_EMAIL,

  // Encrypts private values at rest (client project env variables). Back it
  // up: stored values cannot be read without the same key.
  data_encryption_key: process.env.DATA_ENCRYPTION_KEY || "",
};
