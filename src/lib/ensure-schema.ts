import { pool } from "@/db";

let roleEnumReady = false;

/** Étend l'ENUM MySQL pour inclure le rôle superadmin sans casser les données. */
export async function ensureRoleEnum() {
  if (roleEnumReady) return;
  try {
    await pool.query(
      "ALTER TABLE utilisateurs MODIFY COLUMN role ENUM('superadmin','administrateur','cd','get','abonne') NOT NULL DEFAULT 'abonne'"
    );
    roleEnumReady = true;
  } catch (error) {
    console.error("ensureRoleEnum:", error);
    roleEnumReady = true;
  }
}
