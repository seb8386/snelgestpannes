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

type DashboardStats = {
  reclamations: { total: number };
  interventions: { total: number };
  ordresTravail: { total: number };
  pannesParQuartier: { quartier: string; total: number }[];
};

interface Props {
  onNavigate: (section: Section) => void;
}

export function AdminOverview({ onNavigate }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [iaResponse, setIaResponse] = useState("Lancez l'analyse IA pour un diagnostic du réseau.");
  const [loadingIA, setLoadingIA] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const handleRunIA = async () => {
    setLoadingIA(true);
    try {
      const res = await fetch("/api/ia/analyser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "administrateur",
          stats: {
            pannesActives: stats?.reclamations?.total ?? 0,
            ordresTravail: { enAttente: stats?.ordresTravail?.total ?? 0 },
            tauxResolution: 82,
          },
        }),
      });
      const data = await res.json();
      setIaResponse(data.resultat || "Aucun résultat.");
    } finally {
      setLoadingIA(false);
    }
  };

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
          { label: "Taux résolution", value: "82%", action: "rapports" as Section },
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

        <div className="card p-6 bg-gradient-to-br from-[#003087] to-[#001a4d] text-white">
          <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Agent IA SNEL</p>
          <h2 className="text-lg font-bold mt-2">Diagnostic intelligent</h2>
          <p className="text-blue-200 text-sm mt-2">{iaResponse}</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleRunIA}
              disabled={loadingIA}
              className="px-4 py-2 bg-yellow-400 text-[#003087] rounded-xl text-sm font-bold hover:bg-yellow-300 disabled:opacity-60"
            >
              {loadingIA ? "Analyse..." : "Lancer l'IA"}
            </button>
            <button
              onClick={() => onNavigate("ia")}
              className="px-4 py-2 bg-white/10 rounded-xl text-sm font-semibold hover:bg-white/20"
            >
              Module IA complet
            </button>
          </div>
        </div>
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
