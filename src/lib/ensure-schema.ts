let roleEnumReady = false;

/** Supabase / PostgreSQL gère déjà l'ENUM via le schéma Drizzle. */
export async function ensureRoleEnum() {
  if (roleEnumReady) return;
  // Le rôle superadmin est déjà inclus dans le type pgEnum de Supabase
  roleEnumReady = true;
  return Promise.resolve();
}