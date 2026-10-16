import {
  LayoutDashboard,
  FileText,
  Bell,
  Users,
  Wrench,
  HardHat,
  Brain,
  BarChart3,
  PlusCircle,
  ClipboardList,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/roles";

export type { Role };

export type Section =
  | "dashboard"
  | "reclamations"
  | "nouvelle-reclamation"
  | "ordres-travail"
  | "interventions"
  | "utilisateurs"
  | "ia"
  | "rapports"
  | "notifications";

export interface NavItem {
  id: Section;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const SECTION_TITLES: Record<Section, string> = {
  dashboard: "Tableau de bord",
  reclamations: "Réclamations",
  "nouvelle-reclamation": "Soumettre une réclamation",
  "ordres-travail": "Ordres de travail",
  interventions: "Interventions",
  utilisateurs: "Gestion des utilisateurs",
  ia: "Agent IA — Analyse intelligente",
  rapports: "Rapports & statistiques",
  notifications: "Notifications",
};

const STAFF_FULL_NAV: NavItem[] = [
  { id: "dashboard", label: "Superviser le système", icon: LayoutDashboard },
  { id: "utilisateurs", label: "Gérer les utilisateurs", icon: Users },
  { id: "reclamations", label: "Réclamations", icon: FileText },
  { id: "ordres-travail", label: "Ordres de travail", icon: Wrench },
  { id: "interventions", label: "Interventions", icon: HardHat },
  { id: "ia", label: "Agent IA", icon: Brain },
  { id: "rapports", label: "Générer rapports", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  abonne: [
    { id: "dashboard", label: "Mon espace", icon: LayoutDashboard },
    { id: "nouvelle-reclamation", label: "Soumettre réclamation", icon: PlusCircle },
    { id: "reclamations", label: "Suivre mes réclamations", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  superadmin: [
    { id: "dashboard", label: "Pilotage global", icon: Shield },
    ...STAFF_FULL_NAV.slice(1),
  ],
  administrateur: STAFF_FULL_NAV,
  cd: [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "reclamations", label: "Consulter réclamations", icon: FileText },
    { id: "ordres-travail", label: "Valider & affecter OT", icon: ClipboardList },
    { id: "interventions", label: "Rapports d'intervention", icon: HardHat },
    { id: "ia", label: "Agent IA", icon: Brain },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  get: [
    { id: "dashboard", label: "Mes missions", icon: LayoutDashboard },
    { id: "interventions", label: "Exécuter interventions", icon: HardHat },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
};

export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  superadmin: "/dashboard/super",
  administrateur: "/dashboard/admin",
  cd: "/dashboard/cd",
  get: "/dashboard/get",
  abonne: "/dashboard/abonne",
};

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super utilisateur",
  administrateur: "Administrateur",
  cd: "Chef de Dépannage",
  get: "Technicien GET",
  abonne: "Abonné",
};
