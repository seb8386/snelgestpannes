"use client";

import { useEffect, useState } from "react";
import type { Section } from "@/lib/navigation";
import { AgentIACard } from "@/components/dashboards/AgentIACard";

type Reclamation = {
  id: number;
  description: string;
  localisation: string;
  priorite: string;
  statut: string;
};

type OT = {
  id: number;
  descriptionRec: string | null;
  statut: string;
  urgence: string;
  nomEquipe: string | null;
};

interface Props {
  onNavigate: (section: Section) => void;
}

export function CdOverview({ onNavigate }: Props) {
  const [pendingRecs, setPendingRecs] = useState<Reclamation[]>([]);
  const [ots, setOts] = useState<OT[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recsRes, otsRes] = await Promise.all([
        fetch("/api/reclamations"),
        fetch("/api/ordres-travail"),
      ]);
      const [recsData, otsData] = await Promise.all([recsRes.json(), otsRes.json()]);
      setPendingRecs((recsData || []).filter((r: Reclamation) => r.statut === "en_attente"));
      setOts((otsData || []).filter((o: OT) => o.statut !== "clos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Réclamations en attente", value: pendingRecs.length, section: "reclamations" as Section },
          { label: "OT actifs", value: ots.length, section: "ordres-travail" as Section },
          { label: "À valider", value: ots.filter((o) => o.statut === "valide").length, section: "ordres-travail" as Section },
        ].map((s) => (
          <button key={s.label} onClick={() => onNavigate(s.section)} className="card p-5 text-left hover:ring-2 hover:ring-[#003087]/20">
            <p className="text-xs font-semibold text-gray-500 uppercase">{s.label}</p>
            <p className="text-3xl font-black text-[#003087] mt-2">{loading ? "…" : s.value}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">Réclamations à traiter</h2>
            <button onClick={() => onNavigate("reclamations")} className="text-sm text-[#003087] font-semibold">
              Voir tout →
            </button>
          </div>
          {loading ? (
            <p className="text-gray-400 text-sm">Chargement...</p>
          ) : pendingRecs.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune réclamation en attente.</p>
          ) : (
            <div className="space-y-3">
              {pendingRecs.slice(0, 4).map((rec) => (
                <div key={rec.id} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="font-semibold text-sm">#{rec.id} — {rec.priorite}</p>
                  <p className="text-xs text-gray-500 mt-1">{rec.localisation}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">Ordres de travail</h2>
            <button onClick={() => onNavigate("ordres-travail")} className="text-sm text-[#003087] font-semibold">
              Valider & affecter →
            </button>
          </div>
          {loading ? (
            <p className="text-gray-400 text-sm">Chargement...</p>
          ) : ots.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun OT actif.</p>
          ) : (
            <div className="space-y-3">
              {ots.slice(0, 4).map((ot) => (
                <div key={ot.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-sm">OT #{ot.id}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{ot.descriptionRec}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{ot.urgence}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{ot.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate("interventions")}
          className="card p-5 w-full text-left hover:ring-2 hover:ring-[#003087]/20"
        >
          <h3 className="font-bold text-gray-900">Consulter les rapports d'intervention</h3>
          <p className="text-sm text-gray-500 mt-1">Suivez l'avancement terrain et validez les rapports des techniciens GET</p>
        </button>

        <AgentIACard
          defaultMessage="Lancez l'analyse IA pour prioriser la mobilisation des équipes."
          stats={{
            reclamationsEnAttente: pendingRecs.length,
            ordresTravailActifs: ots.length,
            ordresAValider: ots.filter((o) => o.statut === "valide").length,
          }}
        />
      </div>
    </div>
  );
}
