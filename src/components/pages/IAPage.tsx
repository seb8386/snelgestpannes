"use client";

import { useEffect, useState } from "react";
import { Brain, Zap, CheckCircle, Search, AlertCircle, Sparkles, ListChecks, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { PrioriteBadge } from "@/components/ui/Badge";

interface AnalyseIA {
  typePanne: string;
  priorite: "faible" | "moyenne" | "elevee";
  scoreUrgence: number;
  categorie: string;
  analyse: string;
  suggestions: string[];
}

interface RecommandationIA {
  titre: string;
  detail: string;
  priorite: "faible" | "moyenne" | "elevee";
  reclamationId: number | null;
}

interface SyntheseOperationnelle {
  synthese: string;
  recommandations: RecommandationIA[];
}

interface ReclamationLite {
  id: number;
  description: string;
  localisation: string;
  statut: string;
}

interface Props {
  onNavigateToOT?: (reclamationId: number) => void;
}

export function IAPage({ onNavigateToOT }: Props) {
  // --- Recommandations opérationnelles (connectées aux données réelles) ---
  const [reco, setReco] = useState<SyntheseOperationnelle | null>(null);
  const [loadingReco, setLoadingReco] = useState(false);
  const [recoError, setRecoError] = useState<string | null>(null);

  const handleGenererReco = async () => {
    setLoadingReco(true);
    setRecoError(null);
    try {
      const res = await fetch("/api/ia/recommandations");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setReco(data as SyntheseOperationnelle);
    } catch {
      setRecoError("Impossible de générer les recommandations pour le moment.");
    } finally {
      setLoadingReco(false);
    }
  };

  // --- Analyse ad-hoc d'une description (texte libre ou réclamation existante) ---
  const [reclamations, setReclamations] = useState<ReclamationLite[]>([]);
  const [selectedRecId, setSelectedRecId] = useState("");
  const [description, setDescription] = useState("");
  const [analyse, setAnalyse] = useState<AnalyseIA | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reclamations")
      .then((r) => r.json())
      .then((data) => {
        const pending = Array.isArray(data) ? data.filter((r: ReclamationLite) => r.statut === "en_attente") : [];
        setReclamations(pending);
      })
      .catch(() => setReclamations([]));
  }, []);

  const handleSelectReclamation = (id: string) => {
    setSelectedRecId(id);
    const rec = reclamations.find((r) => r.id === Number(id));
    if (rec) setDescription(rec.description);
  };

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

  const priorityRank: Record<string, number> = { elevee: 0, moyenne: 1, faible: 2 };
  const sortedRecommandations = reco?.recommandations
    ?.slice()
    .sort((a, b) => (priorityRank[a.priorite] ?? 3) - (priorityRank[b.priorite] ?? 3));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#003087] rounded-2xl p-6 text-white shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6" /> Assistant Analyse SNEL
        </h2>
        <p className="text-blue-100 text-sm mt-1">Détection intelligente des pannes et aide à la décision</p>
      </div>

      {/* Recommandations opérationnelles — connectées aux données réelles */}
      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" /> Recommandations opérationnelles
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              L&apos;IA analyse en direct vos réclamations en attente, vos ordres de travail actifs et la disponibilité
              des équipes pour proposer des priorités d&apos;action.
            </p>
          </div>
          <button
            onClick={handleGenererReco}
            disabled={loadingReco}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 shrink-0 disabled:opacity-60"
          >
            {loadingReco ? <Spinner size="sm" /> : <ListChecks size={16} />}
            {loadingReco ? "Analyse..." : reco ? "Actualiser" : "Générer les recommandations"}
          </button>
        </div>

        {recoError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-sm">
            <AlertCircle size={16} /> {recoError}
          </div>
        )}

        {reco && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-700 bg-purple-50 border border-purple-100 rounded-xl p-3">{reco.synthese}</p>

            {sortedRecommandations && sortedRecommandations.length > 0 ? (
              <div className="space-y-2">
                {sortedRecommandations.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{r.titre}</span>
                        <PrioriteBadge priorite={r.priorite} />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{r.detail}</p>
                    </div>
                    {r.reclamationId != null && onNavigateToOT && (
                      <button
                        onClick={() => onNavigateToOT(r.reclamationId as number)}
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-white bg-[#003087] hover:bg-blue-900 px-3 py-1.5 rounded-lg"
                      >
                        <Plus size={13} /> Créer OT
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucune action urgente identifiée pour le moment.</p>
            )}
          </div>
        )}
      </div>

      {/* Analyse d'une panne (texte libre ou réclamation existante) */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Analyser une panne</h3>

        {reclamations.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Réclamation en attente (optionnel) :</label>
            <select
              value={selectedRecId}
              onChange={(e) => handleSelectReclamation(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white"
            >
              <option value="">— Décrire une panne manuellement —</option>
              {reclamations.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} — {r.localisation} — {r.description.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">Description :</label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setSelectedRecId(""); }}
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

        <div className="pt-2">
          {analyse ? (
            <div className="space-y-4 bg-white border border-blue-100 p-6 rounded-2xl shadow-sm">
              <h4 className="font-bold text-lg text-blue-900 border-b pb-2">{analyse.categorie}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{analyse.analyse}</p>

              <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                <span className="text-sm font-bold text-red-800">Score d&apos;urgence</span>
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

              {selectedRecId && onNavigateToOT && (
                <button
                  onClick={() => onNavigateToOT(Number(selectedRecId))}
                  className="btn-primary w-full py-3"
                >
                  Créer un ordre de travail pour cette réclamation
                </button>
              )}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                <Search className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">Prêt à analyser votre description.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
