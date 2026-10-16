interface Props {
  departement: string;
  titre: string;
  numero: string | number;
}

/** En-tête officiel reproduisant les formulaires papier SNEL (Bon de dépannage / Ordre de travail). */
export function PrintHeader({ departement, titre, numero }: Props) {
  return (
    <div className="flex items-start gap-4 border-b-2 border-black pb-3 mb-4">
      <div className="w-14 h-14 shrink-0 rounded-full border-2 border-black flex items-center justify-center font-black text-xs">
        SNEL
      </div>
      <div className="flex-1 text-center">
        <p className="font-bold text-sm uppercase">Société Nationale d&apos;Électricité</p>
        <p className="text-xs uppercase">{departement}</p>
        <p className="font-bold text-base uppercase mt-2 underline">
          {titre} N°<span className="font-mono">{numero}</span>
        </p>
      </div>
    </div>
  );
}

export function PrintField({ label, value, className = "" }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-end gap-1.5 text-xs ${className}`}>
      <span className="shrink-0">{label} :</span>
      <span className="flex-1 border-b border-dotted border-black min-h-[14px] px-1">{value || ""}</span>
    </div>
  );
}
