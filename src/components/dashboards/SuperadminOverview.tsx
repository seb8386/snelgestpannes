"use client";

import type { Section } from "@/lib/navigation";
import { AdminOverview } from "@/components/dashboards/AdminOverview";

interface Props {
  onNavigate: (section: Section) => void;
}

export function SuperadminOverview({ onNavigate }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-yellow-200 bg-linear-to-r from-yellow-50 to-white p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">Super utilisateur</p>
        <h2 className="mt-1 text-xl font-black text-gray-900">Pilotage et administration du système</h2>
        <p className="mt-1 text-sm text-gray-600">
          Vous pouvez utiliser tous les modules opérationnels et gérer les comptes, y compris les administrateurs.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => onNavigate("utilisateurs")} className="btn-primary text-sm">
            Gérer les utilisateurs
          </button>
          <button
            onClick={() => onNavigate("reclamations")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Utiliser les réclamations
          </button>
          <button
            onClick={() => onNavigate("rapports")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Rapports système
          </button>
        </div>
      </div>
      <AdminOverview onNavigate={onNavigate} />
    </div>
  );
}
