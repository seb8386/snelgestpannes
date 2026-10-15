"use client";

import { useEffect, useState } from "react";

type OT = {
  id: number;
  descriptionRec: string | null;
  localisationRec: string | null;
  nomEquipe: string | null;
  statut: string;
  urgence: string;
};

type Notification = {
  id: number;
  titre: string;
  message: string;
  dateEnvoi: string;
  lue: boolean;
  type: string;
};

export function GetDashboard() {
  const [ots, setOts] = useState<OT[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [otsRes, notifsRes] = await Promise.all([
          fetch("/api/ordres-travail"),
          fetch("/api/notifications"),
        ]);

        if (!otsRes.ok || !notifsRes.ok) {
          throw new Error("Erreur de chargement des données GET.");
        }

        const [otsData, notifsData] = await Promise.all([otsRes.json(), notifsRes.json()]);
        setOts(otsData || []);
        setNotifications(notifsData || []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Impossible de charger vos interventions ou notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmitReport = (otId: number) => {
    setSubmitted((prev) => [...prev, otId]);
  };

  const activeCount = ots.length;
  const pendingReports = notifications.filter((notif) => !notif.lue).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(245,197,24,0.15),_transparent_35%),#f7fbff]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.22em] text-[#003087]/70">SNEL · GET</p>
          <h1 className="mt-3 text-4xl font-extrabold text-[#003087]">Mes interventions terrain</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Organisez vos missions, suivez l’état des travaux et déposez vos rapports avec clarté.</p>
        </header>

        {error ? (
          <div className="mb-8 rounded-3xl bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">{error}</div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {[
            { label: "Interventions actives", value: activeCount.toString() },
            { label: "Rapports à valider", value: pendingReports.toString() },
            { label: "Délai moyen", value: "6h" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[28px] bg-white p-6 shadow-xl border border-slate-200">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
              <p className="mt-5 text-4xl font-extrabold text-[#003087]">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-[32px] bg-white shadow-2xl border border-slate-200 p-8 mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#003087]">Intervention en cours</h2>
              <p className="mt-2 text-slate-600">Voici vos affectations terrain et l’état d’avancement de vos OT.</p>
            </div>
            <button
              onClick={() => (submitted.length ? setSubmitted([]) : null)}
              className="rounded-full bg-[#F5C518] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-900 hover:bg-[#e0b912] transition"
            >
              {submitted.length ? "Réinitialiser" : "Soumettre rapport"}
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Chargement des interventions...</p>
          ) : ots.length > 0 ? (
            <div className="space-y-4">
              {ots.slice(0, 3).map((ot) => (
                <div key={ot.id} className="rounded-3xl border border-slate-200 bg-[#f3f7ff] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">OT #{ot.id}</p>
                      <p className="mt-2 text-sm text-slate-600">{ot.descriptionRec || "Aucune description"}</p>
                      <p className="mt-1 text-sm text-slate-500">{ot.localisationRec || "Localisation inconnue"}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="rounded-full bg-[#E63329]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#E63329]">{ot.urgence}</div>
                      <div className="rounded-full bg-[#003087]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#003087]">{ot.nomEquipe || "Équipe non assignée"}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#16A34A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#16A34A]">{ot.statut}</span>
                    <button
                      disabled={submitted.includes(ot.id)}
                      onClick={() => handleSubmitReport(ot.id)}
                      className="rounded-full bg-[#003087] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitted.includes(ot.id) ? "Rapport soumis" : "Soumettre rapport"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Aucune intervention assignée pour le moment.</p>
          )}
        </section>

        <section className="rounded-[32px] bg-white shadow-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-[#003087] mb-5">Notifications récentes</h2>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">{notif.titre}</p>
                  <p className="mt-1 text-sm text-slate-600">{notif.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">{new Date(notif.dateEnvoi).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">Aucune notification pour le moment.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}