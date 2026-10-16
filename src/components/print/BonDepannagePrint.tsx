"use client";

import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PrintHeader, PrintField } from "@/components/print/PrintHeader";
import { TYPE_PANNE_LABELS } from "@/components/ui/Badge";

export interface BonDepannageData {
  id: number;
  otId: number;
  dateIntervention: string;
  dateFin: string | null;
  statut: string;
  rapport: string | null;
  resultat: string | null;
  materielsUtilises: string | null;
  nomTechnicien: string | null;
  descriptionRec: string | null;
  localisationRec: string | null;
  typePanneRec?: string | null;
}

interface Props {
  data: BonDepannageData;
  onClose: () => void;
}

/** Reproduit le formulaire papier « Bon de dépannage » de la SNEL (voir src/docs). */
export function BonDepannagePrint({ data, onClose }: Props) {
  const date = new Date(data.dateIntervention);
  const termine = data.statut === "terminee";

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
          departement="Département de Distribution de Kinshasa"
          titre="Bon de dépannage"
          numero={data.id}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
          <PrintField label="Date" value={format(date, "dd/MM/yyyy", { locale: fr })} />
          <PrintField label="Heure" value={format(date, "HH:mm", { locale: fr })} />
          <PrintField label="Incident signalé" value={data.typePanneRec ? TYPE_PANNE_LABELS[data.typePanneRec] : ""} className="col-span-2" />
          <PrintField label="Adresse" value={data.localisationRec} className="col-span-2" />
          <PrintField label="Agent de garde" value={data.nomTechnicien} />
          <PrintField label="Véhicule N°" />
          <PrintField label="Prévenu à" />
          <PrintField label="Retour / Départ Kms" />
        </div>

        <div className="mb-3">
          <p className="text-xs font-bold uppercase border-b border-black pb-0.5 mb-1">Nature de l&apos;incident</p>
          <p className="text-sm min-h-[2.5rem] whitespace-pre-wrap">{data.descriptionRec || "—"}</p>
        </div>

        <div className="mb-3">
          <p className="text-xs font-bold uppercase border-b border-black pb-0.5 mb-1">Travail effectué</p>
          <p className="text-sm min-h-[3.5rem] whitespace-pre-wrap">{data.rapport || "—"}</p>
          {data.materielsUtilises && (
            <p className="text-xs text-gray-700 mt-1">Matériels utilisés : {data.materielsUtilises}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
          <PrintField label="Réparation définitive" value={termine ? "Oui" : "Non"} />
          <PrintField label="Remise en service à" value={data.dateFin ? format(new Date(data.dateFin), "dd/MM/yyyy HH:mm", { locale: fr }) : ""} />
          <PrintField label="Cabine" />
          <PrintField label="Départ N°" />
          <PrintField label="B.S." />
          <PrintField label="Câble réseau rue" />
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase mb-1">Phase</p>
          <div className="flex gap-4 text-sm">
            <span>○ Rouge</span>
            <span>○ Jaune</span>
            <span>○ Bleu</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-10 pt-4 border-t border-black">
          <PrintField label="Agent" value={data.nomTechnicien} />
          <PrintField label="Matricule" />
          <PrintField label="Signature" />
          <PrintField label="OT référence" value={`#${data.otId}`} />
        </div>
      </div>
    </div>
  );
}
