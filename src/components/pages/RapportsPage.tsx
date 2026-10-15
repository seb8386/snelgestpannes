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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Download, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

type Stats = {
  reclamations: { total: number };
  interventions: { total: number };
  ordresTravail: { total: number };
  pannesParQuartier: { quartier: string; total: number }[];
  pannesParCommune: { commune: string; total: number }[];
};

const COLORS = ["#003087", "#F5C518", "#E63329", "#16A34A", "#6366f1", "#f97316"];

export function RapportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleExport = () => {
    if (!stats) return;
    const report = {
      date: new Date().toISOString(),
      reclamations: stats.reclamations.total,
      interventions: stats.interventions.total,
      ordresTravail: stats.ordresTravail.total,
      pannesParQuartier: stats.pannesParQuartier,
      pannesParCommune: stats.pannesParCommune,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-snel-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Rapport généré le {new Date().toLocaleDateString("fr-FR")}
        </p>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
            <Download size={16} /> Exporter le rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total réclamations", value: stats?.reclamations.total ?? 0 },
          { label: "Interventions", value: stats?.interventions.total ?? 0 },
          { label: "Ordres de travail", value: stats?.ordresTravail.total ?? 0 },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">{s.label}</p>
            <p className="text-3xl font-black text-[#003087] mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">Pannes par quartier</h3>
          <div className="h-72">
            {(stats?.pannesParQuartier?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats!.pannesParQuartier}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quartier" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#003087" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm flex items-center justify-center h-full">Aucune donnée</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">Répartition par commune</h3>
          <div className="h-72">
            {(stats?.pannesParCommune?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats!.pannesParCommune}
                    dataKey="total"
                    nameKey="commune"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(props) => {
                      const { name, value } = props;
                      return `${name}: ${value}`;
                    }}
                  >
                    {stats!.pannesParCommune.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm flex items-center justify-center h-full">Aucune donnée</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
