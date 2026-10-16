"use client";

import { useEffect, useRef, useState } from "react";
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
import { ChevronDown, Download, FileSpreadsheet, FileText, FileJson, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { RapportPrint, type RapportPrintData } from "@/components/print/RapportPrint";

type Stats = {
  reclamations: { total: number };
  interventions: { total: number };
  ordresTravail: { total: number };
  tauxResolution: number;
  pannesParQuartier: { quartier: string; total: number }[];
  pannesParCommune: { commune: string; total: number }[];
};

const COLORS = ["#003087", "#F5C518", "#E63329", "#16A34A", "#6366f1", "#f97316"];

/** Échappe une valeur pour une cellule CSV (Excel/LibreOffice). */
function csvCell(value: string | number): string {
  const str = String(value);
  return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function RapportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const todayStamp = new Date().toISOString().slice(0, 10);

  const handleExportJSON = () => {
    if (!stats) return;
    downloadBlob(
      JSON.stringify({ date: new Date().toISOString(), ...stats }, null, 2),
      "application/json",
      `rapport-snel-${todayStamp}.json`
    );
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    if (!stats) return;
    const lines: string[] = [];
    lines.push("Rapport SNEL CVS Kitambo");
    lines.push(`Généré le;${new Date().toLocaleString("fr-FR")}`);
    lines.push("");
    lines.push("Indicateur;Valeur");
    lines.push(`Total réclamations;${stats.reclamations.total}`);
    lines.push(`Interventions;${stats.interventions.total}`);
    lines.push(`Ordres de travail;${stats.ordresTravail.total}`);
    lines.push(`Taux de résolution;${stats.tauxResolution}%`);
    lines.push("");
    lines.push("Pannes par quartier");
    lines.push("Quartier;Total");
    stats.pannesParQuartier.forEach((p) => lines.push(`${csvCell(p.quartier)};${p.total}`));
    lines.push("");
    lines.push("Répartition par commune");
    lines.push("Commune;Total");
    stats.pannesParCommune.forEach((p) => lines.push(`${csvCell(p.commune)};${p.total}`));

    // BOM pour qu'Excel détecte l'UTF-8 correctement
    downloadBlob("﻿" + lines.join("\n"), "text/csv;charset=utf-8", `rapport-snel-${todayStamp}.csv`);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    setShowPrint(true);
    setShowExportMenu(false);
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
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              disabled={!stats}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 disabled:opacity-60"
            >
              <Download size={16} /> Exporter le rapport <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <FileText size={16} className="text-red-500" />
                  <span>
                    PDF <span className="block text-xs text-gray-400">Document imprimable</span>
                  </span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left border-t border-gray-50"
                >
                  <FileSpreadsheet size={16} className="text-green-600" />
                  <span>
                    Excel (.csv) <span className="block text-xs text-gray-400">Tableaux pour tableur</span>
                  </span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left border-t border-gray-50"
                >
                  <FileJson size={16} className="text-blue-600" />
                  <span>
                    JSON <span className="block text-xs text-gray-400">Données brutes</span>
                  </span>
                </button>
              </div>
            )}
          </div>
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

      {showPrint && stats && (
        <RapportPrint data={stats as RapportPrintData} onClose={() => setShowPrint(false)} />
      )}
    </div>
  );
}
