import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import config from "../config";

/**
 * Optional S3 media storage (reused from the original project's setup).
 *
 * Uploads are enabled only when the bucket, region, credentials AND the public
 * base URL (bucket website or CDN such as CloudFront) are all configured.
 * Without them the admin media library works with URLs only - files are never
 * written to the server's local disk, which would be lost on serverless hosts.
 */
export const isS3Configured = () =>
  Boolean(
    config.aws_s3_bucket_name &&
      config.aws_s3_bucket_region &&
      config.aws_access_key &&
      config.aws_secret_key &&
      config.media_public_base_url,
  );

let client: S3Client | null = null;

export const getS3Client = () => {
  if (!isS3Configured()) {
    throw new Error("S3 media storage is not configured");
  }
  if (!client) {
    client = new S3Client({
      region: config.aws_s3_bucket_region as string,
      credentials: {
        accessKeyId: config.aws_access_key as string,
        secretAccessKey: config.aws_secret_key as string,
      },
    });
  }
  return client;
};

export const publicUrlForKey = (key: string) =>
  `${config.media_public_base_url}/${key}`;

export const deleteS3Object = async (objectKey: string) => {
  const command = new DeleteObjectCommand({
    Bucket: config.aws_s3_bucket_name,
    Key: objectKey,
  });
  return getS3Client().send(command);
};
