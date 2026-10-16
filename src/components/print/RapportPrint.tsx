"use client";

import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface RapportPrintData {
  reclamations: { total: number };
  interventions: { total: number };
  ordresTravail: { total: number };
  tauxResolution: number;
  pannesParQuartier: { quartier: string; total: number }[];
  pannesParCommune: { commune: string; total: number }[];
}

interface Props {
  data: RapportPrintData;
  onClose: () => void;
}

/** Rapport statistique imprimable (destination PDF via l'impression du navigateur). */
export function RapportPrint({ data, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="no-print fixed top-4 right-4 flex gap-2">
        <button
          onClick={() => window.print()}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 shadow-lg"
        >
          <Printer size={16} /> Imprimer / Enregistrer en PDF
        </button>
        <button
          onClick={onClose}
          className="bg-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg flex items-center gap-2"
        >
          <X size={16} /> Fermer
        </button>
      </div>

      <div className="print-area bg-white w-full max-w-[210mm] p-8 text-black">
        <div className="flex items-center gap-4 border-b-2 border-[#003087] pb-4 mb-6">
          <div className="w-14 h-14 shrink-0 rounded-full border-2 border-[#003087] flex items-center justify-center font-black text-xs text-[#003087]">
            SNEL
          </div>
          <div>
            <p className="font-bold text-lg uppercase text-[#003087]">Rapport de gestion des pannes</p>
            <p className="text-sm text-gray-500">SNEL — CVS Kitambo</p>
            <p className="text-xs text-gray-400 mt-1">Généré le {format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}</p>
          </div>
        </div>

        <table className="w-full border-collapse mb-8">
          <tbody>
            {[
              ["Total réclamations", data.reclamations.total],
              ["Interventions", data.interventions.total],
              ["Ordres de travail", data.ordresTravail.total],
              ["Taux de résolution", `${data.tauxResolution}%`],
            ].map(([label, value]) => (
              <tr key={label} className="border border-gray-300">
                <td className="p-2 font-semibold text-sm bg-gray-50 w-1/2">{label}</td>
                <td className="p-2 text-sm font-bold text-[#003087]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="font-bold text-sm uppercase mb-2 text-[#003087]">Pannes par quartier</p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border border-gray-300 bg-gray-50">
                  <th className="p-2 text-left">Quartier</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.pannesParQuartier.length > 0 ? (
                  data.pannesParQuartier.map((p) => (
                    <tr key={p.quartier} className="border border-gray-200">
                      <td className="p-2">{p.quartier}</td>
                      <td className="p-2">{p.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="p-2 text-gray-400" colSpan={2}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <p className="font-bold text-sm uppercase mb-2 text-[#003087]">Répartition par commune</p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border border-gray-300 bg-gray-50">
                  <th className="p-2 text-left">Commune</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.pannesParCommune.length > 0 ? (
                  data.pannesParCommune.map((p) => (
                    <tr key={p.commune} className="border border-gray-200">
                      <td className="p-2">{p.commune}</td>
                      <td className="p-2">{p.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="p-2 text-gray-400" colSpan={2}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
