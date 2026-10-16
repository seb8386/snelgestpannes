"use client";

import { useState } from "react";
import { Brain } from "lucide-react";

interface Props {
  stats: Record<string, unknown>;
  defaultMessage?: string;
  secondaryAction?: { label: string; onClick: () => void };
}

/** Carte réutilisable affichant une synthèse IA générée en direct à partir des stats du rôle. */
export function AgentIACard({ stats, defaultMessage = "Lancez l'analyse IA pour un diagnostic personnalisé.", secondaryAction }: Props) {
  const [reponse, setReponse] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);

  const handleRunIA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ia/analyser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });
      const data = await res.json();
      setReponse(data.resultat || "Aucun résultat.");
    } catch {
      setReponse("L'Agent IA est temporairement indisponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 bg-linear-to-br from-[#003087] to-[#001a4d] text-white">
      <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
        <Brain size={14} /> Agent IA SNEL
      </p>
      <h2 className="text-lg font-bold mt-2">Diagnostic intelligent</h2>
      <p className="text-blue-200 text-sm mt-2">{reponse}</p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleRunIA}
          disabled={loading}
          className="px-4 py-2 bg-yellow-400 text-[#003087] rounded-xl text-sm font-bold hover:bg-yellow-300 disabled:opacity-60"
        >
          {loading ? "Analyse..." : "Lancer l'IA"}
        </button>
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-4 py-2 bg-white/10 rounded-xl text-sm font-semibold hover:bg-white/20"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
