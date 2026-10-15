"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Section } from "@/lib/navigation";
import { StatutBadge, PrioriteBadge } from "@/components/ui/Badge";

type Reclamation = {
  id: number;
  description: string;
  localisation: string;
  statut: string;
  priorite: string;
  typePanne: string;
  scoreIa: number | null;
  dateReclamation: string;
};

interface Props {
  onNavigate: (section: Section) => void;
}

export function AbonneOverview({ onNavigate }: Props) {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reclamations")
      .then((r) => r.json())
      .then((data) => setReclamations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const ouvertes = reclamations.filter((r) => r.statut === "en_attente" || r.statut === "en_cours");
  const resolues = reclamations.filter((r) => r.statut === "resolu" || r.statut === "ferme");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onNavigate("nouvelle-reclamation")}
          className="btn-primary px-6 py-3 text-sm font-semibold"
        >
          + Soumettre une réclamation
        </button>
        <button
          onClick={() => onNavigate("reclamations")}
          className="px-6 py-3 text-sm font-semibold border border-gray-200 rounded-xl bg-white hover:bg-gray-50"
        >
          Suivre mes réclamations
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Demandes ouvertes</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{loading ? "…" : ouvertes.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Résolues</p>
          <p className="text-3xl font-black text-green-600 mt-2">{loading ? "…" : resolues.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
          <p className="text-3xl font-black text-[#003087] mt-2">{loading ? "…" : reclamations.length}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-gray-900 mb-4">Dernières réclamations</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Chargement...</p>
        ) : reclamations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Aucune réclamation enregistrée.</p>
            <button
              onClick={() => onNavigate("nouvelle-reclamation")}
              className="mt-4 text-[#003087] font-semibold text-sm hover:underline"
            >
              Déclarer votre première panne →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reclamations.slice(0, 5).map((rec) => (
              <div key={rec.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-400">#{rec.id}</span>
                  <StatutBadge statut={rec.statut} />
                  <PrioriteBadge priorite={rec.priorite} />
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{rec.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  📍 {rec.localisation} · {format(new Date(rec.dateReclamation), "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
