import mongoose from "mongoose";
import config from ".";
import { logger } from "../utils/logger";

mongoose.set("strictQuery", true);

// A single shared promise means concurrent requests during a cold start wait
// for the same connection attempt instead of opening several. On failure the
// promise is cleared so the next request retries (important on serverless
// platforms where the process may outlive a temporary database outage).
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!config.database_url) {
    return Promise.reject(
      new Error("mongoDbUrl is not configured. See Server/.env.example"),
    );
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(config.database_url, {
        dbName: config.database_name,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then(connection => {
        logger.info(
          `Database connected (db: ${connection.connection.db?.databaseName})`,
        );
        return connection;
      })
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const disconnectDatabase = async () => {
  connectionPromise = null;
  await mongoose.disconnect();
};
