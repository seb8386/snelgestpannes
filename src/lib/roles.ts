export const ROLES = ["superadmin", "administrateur", "cd", "get", "abonne"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_RANK: Record<Role, number> = {
  superadmin: 100,
  administrateur: 80,
  cd: 50,
  get: 30,
  abonne: 10,
};

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}

export function hasMinRole(userRole: string, min: Role): boolean {
  if (!isRole(userRole)) return false;
  return ROLE_RANK[userRole] >= ROLE_RANK[min];
}

/** Accès opérationnel + administration complète du système */
export function isSuperadmin(role: string) {
  return role === "superadmin";
}

/** Administration opérationnelle (sans créer/modifier un super-utilisateur) */
export function isAdministrateur(role: string) {
  return role === "administrateur";
}

export function canManageUsers(role: string) {
  return role === "superadmin" || role === "administrateur";
}

export function canCreateOT(role: string) {
  return ["superadmin", "administrateur", "cd"].includes(role);
}

export function canPatchReclamation(role: string) {
  return canCreateOT(role);
}

export function canDeleteAnyReclamation(role: string) {
  return ["superadmin", "administrateur"].includes(role);
}

export function canCreateIntervention(role: string) {
  return ["superadmin", "administrateur", "cd", "get"].includes(role);
}

export function canManageEquipes(role: string) {
  return canCreateOT(role);
}

export function canUseIAModule(role: string) {
  return ["superadmin", "administrateur"].includes(role);
}

export function isStaff(role: string) {
  return role !== "abonne";
}

export function canAssignRole(actorRole: string, targetRole: string) {
  if (!isRole(targetRole)) return false;
  if (actorRole === "superadmin") return true;
  if (actorRole === "administrateur") return targetRole !== "superadmin";
  return false;
}

export function canMutateUser(actor: { role: string; userId: number }, target: { role: string; id: number }) {
  if (!canManageUsers(actor.role)) return false;
  if (target.id === actor.userId) return true;
  if (target.role === "superadmin" && actor.role !== "superadmin") return false;
  return true;
}

export const ASSIGNABLE_ROLES: Record<"superadmin" | "administrateur", Role[]> = {
  superadmin: [...ROLES],
  administrateur: ["administrateur", "cd", "get", "abonne"],
};
