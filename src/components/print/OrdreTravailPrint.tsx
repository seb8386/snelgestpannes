"use client";

import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PrintHeader, PrintField } from "@/components/print/PrintHeader";

export interface OrdreTravailPrintData {
  id: number;
  dateCreation: string;
  statut: string;
  urgence: string;
  instructions: string | null;
  dateEcheance: string | null;
  descriptionRec: string | null;
  localisationRec: string | null;
  nomEquipe: string | null;
  nomCreateur: string | null;
}

interface Props {
  data: OrdreTravailPrintData;
  onClose: () => void;
}

/** Reproduit le formulaire papier « Ordre de travail » de la SNEL (voir src/docs). */
export function OrdreTravailPrint({ data, onClose }: Props) {
  const statutTravail = data.statut === "clos" ? "Travail terminé" : "Travail en cours";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="no-print fixed top-4 right-4 flex gap-2">
        <button
          onClick={() => window.print()}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 shadow-lg"
        >
          <Printer size={16} /> Imprimer
        </button>
        <button
          onClick={onClose}
          className="bg-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg flex items-center gap-2"
        >
          <X size={16} /> Fermer
        </button>
      </div>

      <div className="print-area bg-white w-full max-w-[210mm] p-8 text-black font-serif shadow-2xl">
        <PrintHeader
          departement="Département Provincial de Kinshasa — B.P 449 KIN 1 - R.D.C"
          titre="A. Ordre de travail"
          numero={data.id}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
          <PrintField label="Du" value={format(new Date(data.dateCreation), "dd/MM/yyyy", { locale: fr })} />
          <PrintField label="Statut" value={statutTravail} />
          <PrintField label="Objet" value={data.descriptionRec} className="col-span-2" />
          <PrintField label="Nature et lieu du travail" value={data.localisationRec} className="col-span-2" />
          <PrintField label="Désignation (équipe)" value={data.nomEquipe || "Non assignée"} />
          <PrintField label="Urgence" value={data.urgence} />
          <PrintField label="Service demandeur" value={data.nomCreateur} />
          <PrintField label="Échéance" value={data.dateEcheance ? format(new Date(data.dateEcheance), "dd/MM/yyyy HH:mm", { locale: fr }) : ""} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mt-8 pt-3 border-t border-black text-sm">
          <div>
            <p className="font-bold uppercase text-xs mb-2">Visas des chefs hiérarchiques</p>
            <div className="h-10 border-b border-dotted border-black" />
          </div>
          <div>
            <p className="font-bold uppercase text-xs mb-2">Réservé à la comptabilité</p>
            <PrintField label="Imputation (n° compte)" />
            <PrintField label="Affection (n° compte)" className="mt-2" />
          </div>
        </div>

        <div className="mt-8 pt-3 border-t-2 border-black">
          <p className="font-bold uppercase text-sm mb-2">B. Rapport de travaux</p>
          <p className="text-xs font-bold uppercase mb-1">1. Travaux exécutés</p>
          {data.instructions && (
            <p className="text-sm mb-2 italic">Instructions : {data.instructions}</p>
          )}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-b border-dotted border-black h-4" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
