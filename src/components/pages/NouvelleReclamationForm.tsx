"use client";

import { useState } from "react";
import { Brain, CheckCircle } from "lucide-react";

interface Props {
  onSuccess?: () => void;
}

export function NouvelleReclamationForm({ onSuccess }: Props) {
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [iaPreview, setIaPreview] = useState<{ categorie: string; priorite: string; score: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !localisation.trim()) {
      setStatus("error");
      setMessage("La description et la localisation sont obligatoires.");
      return;
    }

    try {
      setStatus("sending");
      setMessage("");

      const res = await fetch("/api/reclamations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, localisation }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error || "Erreur lors de l'envoi.");
        return;
      }

      setStatus("success");
      setMessage(`Réclamation #${data.id} enregistrée. L'Agent IA a classifié votre panne : ${data.ia?.categorie || "—"}.`);
      if (data.ia) {
        setIaPreview({ categorie: data.ia.categorie, priorite: data.ia.priorite, score: data.ia.scoreUrgence });
      }
      setDescription("");
      setLocalisation("");
    } catch {
      setStatus("error");
      setMessage("Impossible d'envoyer la réclamation.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6 bg-gradient-to-r from-[#003087] to-blue-800 text-white">
        <h2 className="text-xl font-bold">Soumettre une réclamation</h2>
        <p className="text-blue-100 text-sm mt-2">
          Décrivez votre panne. L'Agent IA analysera automatiquement votre demande et notifiera les équipes SNEL.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description de la panne *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            placeholder="Ex: Coupure totale de courant dans mon quartier depuis ce matin..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]/20 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Localisation *</label>
          <input
            type="text"
            value={localisation}
            onChange={(e) => setLocalisation(e.target.value)}
            required
            placeholder="Quartier, avenue, commune..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#003087] focus:ring-1 focus:ring-[#003087]/20 outline-none"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm flex items-start gap-2 ${
            status === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {status === "success" && <CheckCircle size={18} className="shrink-0 mt-0.5" />}
            {message}
          </div>
        )}

        {iaPreview && status === "success" && (
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <div className="flex items-center gap-2 text-purple-800 font-semibold text-sm">
              <Brain size={16} /> Analyse Agent IA
            </div>
            <p className="text-sm text-purple-700 mt-2">
              {iaPreview.categorie} · Priorité {iaPreview.priorite} · Score {iaPreview.score}/100
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary flex-1 py-3 disabled:opacity-60"
          >
            {status === "sending" ? "Envoi en cours..." : "Envoyer la réclamation"}
          </button>
          {status === "success" && onSuccess && (
            <button type="button" onClick={onSuccess} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
              Voir mes réclamations
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
