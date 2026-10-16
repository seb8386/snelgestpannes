"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Section } from "@/lib/navigation";
import { AgentIACard } from "@/components/dashboards/AgentIACard";

type DashboardStats = {
  reclamations: { total: number };
  interventions: { total: number };
  ordresTravail: { total: number };
  tauxResolution: number;
  pannesParQuartier: { quartier: string; total: number }[];
};

interface Props {
  onNavigate: (section: Section) => void;
}

export function AdminOverview({ onNavigate }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const chartData =
    stats?.pannesParQuartier?.length
      ? stats.pannesParQuartier.map((q) => ({ quartier: q.quartier, total: q.total }))
      : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Réclamations", value: stats?.reclamations?.total ?? 0, action: "reclamations" as Section },
          { label: "Interventions", value: stats?.interventions?.total ?? 0, action: "interventions" as Section },
          { label: "Ordres de travail", value: stats?.ordresTravail?.total ?? 0, action: "ordres-travail" as Section },
          { label: "Taux résolution", value: `${stats?.tauxResolution ?? 0}%`, action: "rapports" as Section },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => onNavigate(s.action)}
            className="card p-5 text-left hover:ring-2 hover:ring-[#003087]/20 transition"
          >
            <p className="text-xs font-semibold text-gray-500 uppercase">{s.label}</p>
            <p className="text-3xl font-black text-[#003087] mt-2">{s.value}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Supervision du réseau</h2>
              <p className="text-sm text-gray-500">Pannes par quartier</p>
            </div>
            <button onClick={() => onNavigate("rapports")} className="text-sm text-[#003087] font-semibold hover:underline">
              Voir rapports →
            </button>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quartier" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#003087" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm flex items-center justify-center h-full">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        <AgentIACard
          defaultMessage="Lancez l'analyse IA pour un diagnostic du réseau."
          stats={{
            reclamationsTotal: stats?.reclamations?.total ?? 0,
            interventionsTotal: stats?.interventions?.total ?? 0,
            ordresTravailTotal: stats?.ordresTravail?.total ?? 0,
            tauxResolution: stats?.tauxResolution ?? 0,
            pannesParQuartier: stats?.pannesParQuartier ?? [],
          }}
          secondaryAction={{ label: "Module IA complet", onClick: () => onNavigate("ia") }}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Gérer les utilisateurs", desc: "Créer, modifier, désactiver les comptes", section: "utilisateurs" as Section },
          { title: "Analyser les plaintes", desc: "Classification IA des pannes", section: "ia" as Section },
          { title: "Générer des rapports", desc: "Statistiques et exports", section: "rapports" as Section },
        ].map((a) => (
          <button
            key={a.title}
            onClick={() => onNavigate(a.section)}
            className="card p-5 text-left hover:border-[#003087]/30 border border-transparent transition"
          >
            <h3 className="font-bold text-gray-900">{a.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
