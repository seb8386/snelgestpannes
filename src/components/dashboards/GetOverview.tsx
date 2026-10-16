"use client";

import { useEffect, useState } from "react";
import type { Section } from "@/lib/navigation";
import { AgentIACard } from "@/components/dashboards/AgentIACard";

type OT = {
  id: number;
  descriptionRec: string | null;
  localisationRec: string | null;
  statut: string;
  urgence: string;
  nomEquipe: string | null;
};

interface Props {
  onNavigate: (section: Section) => void;
}

export function GetOverview({ onNavigate }: Props) {
  const [ots, setOts] = useState<OT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ordres-travail")
      .then((r) => r.json())
      .then((data) => setOts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const actives = ots.filter((o) => o.statut !== "clos");
  const urgentes = actives.filter((o) => o.urgence === "critique" || o.urgence === "urgent");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Missions reçues", value: actives.length },
          { label: "Urgentes", value: urgentes.length },
          { label: "En cours", value: actives.filter((o) => o.statut === "affecte").length },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase">{s.label}</p>
            <p className="text-3xl font-black text-[#003087] mt-2">{loading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Missions terrain</h2>
            <p className="text-sm text-gray-500">Recevoir et exécuter vos interventions assignées</p>
          </div>
          <button
            onClick={() => onNavigate("interventions")}
            className="btn-primary text-sm px-4 py-2"
          >
            Exécuter interventions
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement...</p>
        ) : actives.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune mission assignée pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {actives.slice(0, 5).map((ot) => (
              <div key={ot.id} className="p-4 rounded-xl border border-gray-100 bg-[#f3f7ff]">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-bold text-gray-900">OT #{ot.id}</p>
                    <p className="text-sm text-gray-600 mt-1">{ot.descriptionRec}</p>
                    <p className="text-xs text-gray-400 mt-1">📍 {ot.localisationRec}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    ot.urgence === "critique" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {ot.urgence}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate("interventions")}
          className="card p-5 w-full text-left hover:ring-2 hover:ring-[#003087]/20"
        >
          <h3 className="font-bold text-gray-900">Envoyer un rapport d'intervention</h3>
          <p className="text-sm text-gray-500 mt-1">Documentez vos travaux, matériels utilisés et résultats obtenus</p>
        </button>

        <AgentIACard
          defaultMessage="Lancez l'analyse IA pour organiser votre plan de terrain."
          stats={{
            missionsActives: actives.length,
            missionsUrgentes: urgentes.length,
          }}
        />
      </div>
    </div>
  );
}
