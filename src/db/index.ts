import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Configuration du client PostgreSQL pour les environnements Serverless (Vercel)
const client = postgres(databaseUrl, { prepare: false });

// Initialisation de Drizzle avec un typage explicite PostgreSQL
export const db: PostgresJsDatabase<typeof schema> = drizzle(client, { schema });