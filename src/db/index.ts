import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Configuration du client PostgreSQL pour les environnements Serverless (Vercel)
const client = postgres(databaseUrl, { prepare: false });

// Initialisation de Drizzle avec le schéma PostgreSQL
export const db = drizzle(client, { schema });