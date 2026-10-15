"use client";

import { useState } from "react";
import { Brain, Zap, CheckCircle, Search, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

interface AnalyseIA {
  typePanne: string;
  priorite: "faible" | "moyenne" | "elevee";
  scoreUrgence: number;
  categorie: string;
  analyse: string;
  suggestions: string[];
}

export function IAPage() {
  const [description, setDescription] = useState("");
  const [analyse, setAnalyse] = useState<AnalyseIA | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyse = async () => {
    if (!description.trim() || description.length < 10) {
      alert("La description est trop courte (min 10 caractères)");
      return;
    }
    
    setLoading(true);
    setAnalyse(null);
    setError(null);

    try {
      const res = await fetch("/api/ia/analyser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Erreur serveur");

      setAnalyse(data as AnalyseIA);
    } catch (err) {
      console.error("Erreur complète:", err);
      setError("Impossible d'analyser la panne.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#003087] rounded-2xl p-6 text-white shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6" /> Assistant Analyse SNEL
        </h2>
        <p className="text-blue-100 text-sm mt-1">Détection intelligente des pannes</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2 border border-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Zone de saisie */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 ml-1">Description :</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 border border-gray-200 rounded-xl text-sm h-40 focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Le transformateur fait un bruit anormal..."
        />
      </div>

      <button
        onClick={handleAnalyse}
        disabled={loading}
        className="w-full bg-[#003087] hover:bg-blue-900 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold shadow-md flex justify-center items-center gap-2"
      >
        {loading ? <Spinner size="sm" /> : <><Zap size={18} /> Analyser panne</>}
      </button>

      {/* Résultats */}
      <div className="pt-2">
        {analyse ? (
          <div className="space-y-4 bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
            <h4 className="font-bold text-lg text-blue-900 border-b pb-2">{analyse.categorie}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{analyse.analyse}</p>
            
            <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
              <span className="text-sm font-bold text-red-800">Score d'urgence</span>
              <span className="text-2xl font-black text-red-600">{analyse.scoreUrgence}/100</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Suggestions :</span>
              {analyse.suggestions.map((s, i) => (
                <div key={i} className="text-sm flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                  <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" /> 
                  <span className="text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div> // Fin du bloc analyse
        ) : (
          !loading && (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
              <Search className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">Prêt à analyser votre description.</p>
            </div>
          ) // Fin du bloc !loading
        )}
      </div> {/* Fin du bloc "pt-2" */}
    </div> // Fin du conteneur principal
  );
}