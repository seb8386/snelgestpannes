"use client";

import { useEffect, useState } from "react";

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
  localisationRec: string | null;
  prioriteRec: string | null;
  statut: string;
  urgence: string;
  nomEquipe: string | null;
};

export function CdDashboard() {
  const [ots, setOts] = useState<OT[]>([]);
  const [pendingRecs, setPendingRecs] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [otsRes, recsRes] = await Promise.all([
        fetch("/api/ordres-travail"),
        fetch("/api/reclamations"),
      ]);

      if (!otsRes.ok || !recsRes.ok) {
        throw new Error("Erreur de chargement");
      }

      const [otsData, recsData] = await Promise.all([otsRes.json(), recsRes.json()]);
      setOts(otsData || []);
      setPendingRecs(
        (recsData || []).filter((rec: Reclamation) => rec.statut === "en_attente")
      );
    } catch (error) {
      console.error(error);
      setMessage("Impossible de charger les ordres de travail ou les réclamations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOT = async (reclamationId: number) => {
    try {
      setMessage("Création de l'ordre de travail en cours...");
      const response = await fetch("/api/ordres-travail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reclamationId,
          urgence: "urgent",
          instructions: "Affectation CD automatique",
          equipeId: null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Erreur de création OT");
      }

      setMessage("Ordre de travail créé avec succès.");
      loadData();
    } catch (error) {
      console.error(error);
      setMessage("Impossible de créer l'ordre de travail.");
    }
  };

  const pendingCount = pendingRecs.length;
  const otCount = ots.length;

  return (
    <div className="min-h-screen bg-[#f2f6ff]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#003087]/70">SNEL · Chef de Depannage</p>
            <h1 className="mt-3 text-4xl font-extrabold text-[#003087]">Tableau de bord chef de Deppanage</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Supervisez les interventions, gérez les équipes et priorisez les ordres de travail.</p>
          </div>
          <button
            onClick={loadData}
            className="rounded-full bg-[#F5C518] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-900 shadow-lg shadow-[#003087]/10 hover:bg-[#e0b912] transition"
          >
            {loading ? "Chargement..." : "Rafraîchir"}
          </button>
        </header>

        {message ? (
          <div className="mb-6 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 shadow-sm">{message}</div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3 mb-10">
          {[
            { label: "OT suivis", value: otCount.toString() },
            { label: "Réclamations en attente", value: pendingCount.toString() },
            { label: "Taux de résolution", value: "91%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[28px] bg-white p-6 shadow-xl border border-slate-200">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
              <p className="mt-5 text-4xl font-extrabold text-[#003087]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] bg-white shadow-2xl border border-slate-200 p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#003087]">Interventions en file d'attente</h2>
                <p className="mt-2 text-slate-600">Gérez les réclamations prioritaires à traiter rapidement.</p>
              </div>
              <span className="rounded-full bg-[#E63329]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E63329]">
                {pendingCount} en attente
              </span>
            </div>

            <div className="space-y-4">
              {pendingRecs.length > 0 ? (
                pendingRecs.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="rounded-3xl border border-[#003087]/10 bg-[#f3f7ff] p-5">
                    <p className="text-lg font-semibold text-slate-900">Réclamation #{rec.id}</p>
                    <p className="mt-2 text-sm text-slate-600">{rec.localisation} • {rec.priorite}</p>
                    <p className="mt-3 text-sm text-slate-500">{rec.description}</p>
                    <button
                      onClick={() => handleCreateOT(rec.id)}
                      className="mt-4 inline-flex rounded-full bg-[#003087] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition"
                    >
                      Créer OT
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Aucune réclamation en attente pour le moment.</p>
              )}
            </div>
          </div>

          <div className="rounded-[32px] bg-white shadow-2xl border border-slate-200 p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#003087]">Ordres de travail actuels</h2>
                <p className="mt-2 text-slate-600">Suivez les interventions déjà engagées.</p>
              </div>
              <span className="rounded-full bg-[#0b3b72]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0b3b72]">
                {otCount} actifs
              </span>
            </div>

            <div className="space-y-4">
              {ots.length > 0 ? (
                ots.slice(0, 4).map((ot) => (
                  <div key={ot.id} className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-lg font-semibold text-slate-900">OT #{ot.id}</p>
                    <p className="mt-2 text-sm text-slate-600">{ot.descriptionRec || "Aucune description"}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.12em]">
                      <span className="rounded-full bg-[#F5C518]/20 px-3 py-1 text-[#3a3a3a]">{ot.urgence}</span>
                      <span className="rounded-full bg-[#003087]/10 px-3 py-1 text-[#003087]">{ot.nomEquipe || "Équipe non assignée"}</span>
                      <span className="rounded-full bg-[#16A34A]/10 px-3 py-1 text-[#16A34A]">{ot.statut}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Aucun ordre de travail actif pour l'instant.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}