"use client";
import { useState, useEffect } from "react";

export function DashboardPage({ userRole }: { userRole: 'superadmin' | 'administrateur' | 'cd' | 'get' | 'abonne' }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Appel API pour récupérer les données réelles
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div>Chargement...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Tableau de Bord</h1>

      {/* Cartes KPI (Design) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Pannes" value={stats.total} trend="+12%" color="text-blue-600" />
        <StatCard title="En cours" value={stats.encours} trend="2 nouvelles" color="text-orange-500" />
        <StatCard title="Résolus" value={stats.resolus} trend="+8%" color="text-green-500" />
        <StatCard title="Clients affectés" value={stats.clients} trend="3 critiques" color="text-red-500" />
      </div>

      {/* Section Critique (Liste d'actions) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
        <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center">
          ⚠ Critiques de Pannes - Action requise
        </h2>
        <div className="space-y-4">
          {stats.critiques?.map((panne: any) => (
            <div key={panne.id} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50">
              <div>
                <p className="font-bold">{panne.titre}</p>
                <p className="text-sm text-gray-500">{panne.localisation} • {panne.clients} clients affectés</p>
              </div>
              <button className="bg-red-500 text-white px-4 py-1 rounded text-sm font-semibold">
                Intervenir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Composant pour les petites cartes de stats
function StatCard({ title, value, trend, color }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{trend}</p>
    </div>
  );
}