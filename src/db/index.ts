import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Configuration du pool de connexion MySQL
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsMysqlPool?: mysql.Pool;
};

export const pool =
  globalForDb.__arenaNextJsMysqlPool ??
  mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsMysqlPool = pool;
}

// Initialisation de Drizzle avec le driver MySQL
export const db = drizzle(pool);