"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardStats = {
  reclamations: { total: number };
  interventions: { total: number };
  ordresTravail: { total: number };
  pannesParQuartier: { quartier: string; total: number }[];
  pannesParCommune: { commune: string; total: number }[];
};

const fallbackEvolution = [
  { periode: "Semaine 1", pannes: 18, interventions: 12 },
  { periode: "Semaine 2", pannes: 14, interventions: 15 },
  { periode: "Semaine 3", pannes: 11, interventions: 18 },
  { periode: "Semaine 4", pannes: 8, interventions: 22 },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [iaResponse, setIaResponse] = useState(
    "Cliquez sur 'Lancer l'IA' pour obtenir un diagnostic IA du réseau."
  );
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          throw new Error("Impossible de récupérer les statistiques");
        }
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
        setFetchError("Impossible de charger les statistiques du dashboard.");
      } finally {
        setLoadingData(false);
      }
    };

    getStats();
  }, []);

  const handleRunIA = async () => {
    setLoadingIA(true);
    setIaResponse("Analyse en cours par l'Agent IA SNEL...");

    try {
      const statsPayload = {
        pannesActives: stats?.reclamations?.total ?? 0,
        ordresTravail: { enAttente: stats?.ordresTravail?.total ?? 0 },
        tauxResolution: 82,
      };

      const res = await fetch("/api/ia/analyser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "administrateur", stats: statsPayload }),
      });

      const data = await res.json();
      setIaResponse(data.resultat || "Aucun résultat retourné par l'IA.");
    } catch (error) {
      console.error(error);
      setIaResponse("Erreur lors de la communication avec l'IA.");
    } finally {
      setLoadingIA(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const statisticData = [
    { label: "Pannes actives", value: stats?.reclamations?.total ?? 0 },
    { label: "Interventions en cours", value: stats?.interventions?.total ?? 0 },
    { label: "Ordres de travail", value: stats?.ordresTravail?.total ?? 0 },
    { label: "Taux de résolution", value: 82 },
  ];

  const chartData = stats?.pannesParQuartier && stats.pannesParQuartier.length
    ? stats.pannesParQuartier.map((item) => ({
        periode: item.quartier,
        pannes: item.total,
      }))
    : fallbackEvolution;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* --- HEADER --- */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "32px" }}>
          <div>
            <p style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "12px", fontWeight: "bold", color: "#3b82f6", margin: "0 0 8px 0" }}>
              SNEL - Administrateur
            </p>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
              Dashboard administrateur
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Pilotez le réseau, surveillez les incidents et activez l’intelligence opérationnelle.
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
              transition: "background 0.2s"
            }}
          >
            Déconnexion
          </button>
        </header>

        {fetchError ? (
          <div style={{ padding: "16px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "12px", color: "#991b1b", fontSize: "14px", marginBottom: "24px" }}>
            {fetchError}
          </div>
        ) : null}

        {/* --- BLOC PRINCIPAL DE CONTENU --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          
          {/* COLONNE GAUCHE: GRAPHIQUE ET METRICS */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>Tableau de bord réseau</h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Suivez les pannes, les interventions et les indicateurs de performance critiques.</p>
              </div>
              <button
                onClick={handleRunIA}
                disabled={loadingIA}
                style={{
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
                  opacity: loadingIA ? 0.7 : 1,
                  transition: "background 0.2s"
                }}
              >
                {loadingIA ? "Analyse..." : "Lancer l'IA"}
              </button>
            </div>

            {/* METRICS INTERNES */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {statisticData.map((item) => (
                <div key={item.label} style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", margin: "0 0 8px 0", letterSpacing: "0.05em" }}>{item.label}</p>
                  <p style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                    {item.label === "Taux de résolution" ? `${item.value}%` : item.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* RECHARTS COMPONENT */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" }}>Évolution des pannes par quartier</h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 20px 0" }}>Histogramme des réclamations regroupées par quartier.</p>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 12, right: 18, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="periode" tick={{ fill: "#475569", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#cbd5e1" }} />
                    <Legend />
                    <Bar dataKey="pannes" name="Pannes" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE: AGENT IA VOLET SOMBRE */}
          <div style={{ backgroundColor: "#0f172a", borderRadius: "20px", padding: "32px", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <p style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "11px", fontWeight: "bold", color: "#fbbf24", margin: "0 0 12px 0" }}>Agent IA SNEL</p>
              <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 12px 0" }}>Diagnostic intelligent</h2>
              <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 32px 0" }}>
                Utilisez l'intelligence SNEL pour anticiper les pannes, établir des priorités et réduire les temps d'arrêt sur l'ensemble du réseau.
              </p>
              
              <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "24px" }}>
                <p style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "600", textTransform: "uppercase", margin: "0 0 8px 0" }}>Dernier résultat</p>
                <p style={{ fontSize: "14px", color: "#f1f5f9", lineHeight: "1.6", margin: 0 }}>{iaResponse}</p>
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff", margin: "0 0 12px 0" }}>Conseils IA</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "10px" }}>
                <li>• Surveillez les tendances hebdomadaires de pannes.</li>
                <li>• Déclenchez des équipes supplémentaires si le volume augmente.</li>
                <li>• Concentrez les interventions sur les zones à fort impact.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* --- PRIORITÉS OPÉRATIONNELLES --- */}
        <section style={{ backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 20px 0" }}>Priorités opérationnelles</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {[
              { title: "Coupe totale", subtitle: "Avenue de la Justice", status: "Critique", color: "#ef4444" },
              { title: "Inspection compteur", subtitle: "Kinsuka", status: "Planifiée", color: "#f5c518" },
              { title: "Rénovation réseau", subtitle: "Kisangani", status: "En cours", color: "#10b981" },
            ].map((item) => (
              <div key={item.title} style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#64748b", margin: "0 0 8px 0" }}>{item.title}</p>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{item.subtitle}</p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#ffffff", backgroundColor: item.color, padding: "4px 10px", borderRadius: "20px" }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}