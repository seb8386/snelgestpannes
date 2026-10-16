"use client";

import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatutBadge({ statut }: { statut: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    en_attente: { label: "En attente", variant: "warning" },
    en_cours: { label: "En cours", variant: "info" },
    resolu: { label: "Résolu", variant: "success" },
    ferme: { label: "Fermé", variant: "default" },
    valide: { label: "Validé", variant: "info" },
    affecte: { label: "Affecté", variant: "warning" },
    clos: { label: "Clos", variant: "success" },
    planifiee: { label: "Planifiée", variant: "default" },
    terminee: { label: "Terminée", variant: "success" },
    annulee: { label: "Annulée", variant: "danger" },
  };

  const c = config[statut] || { label: statut, variant: "default" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export function PrioriteBadge({ priorite }: { priorite: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    faible: { label: "🟢 Faible", variant: "success" },
    moyenne: { label: "🟡 Moyenne", variant: "warning" },
    elevee: { label: "🔴 Élevée", variant: "danger" },
  };

  const c = config[priorite] || { label: priorite, variant: "default" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export const TYPE_PANNE_LABELS: Record<string, string> = {
  coupure_secteur: "Coupure de secteur",
  court_circuit: "Court-circuit",
  surcharge: "Surcharge / Fluctuation",
  probleme_compteur: "Problème de compteur",
  probleme_cablage: "Problème de câblage",
  autre: "Autre",
};

export function TypePanneBadge({ typePanne }: { typePanne: string }) {
  return <Badge variant="info">{TYPE_PANNE_LABELS[typePanne] || typePanne}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    superadmin: { label: "Super utilisateur", variant: "warning" },
    administrateur: { label: "Administrateur", variant: "danger" },
    cd: { label: "Chef de Dépannage", variant: "info" },
    get: { label: "Technicien GET", variant: "warning" },
    abonne: { label: "Abonné", variant: "success" },
  };

  const c = config[role] || { label: role, variant: "default" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
