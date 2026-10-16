"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Plus, Brain, Eye } from "lucide-react";
import { User } from "@/components/layout/Sidebar";
import { canCreateOT } from "@/lib/roles";
import { StatutBadge, PrioriteBadge, TypePanneBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Reclamation {
  id: number;
  description: string;
  localisation: string;
  statut: string;
  priorite: string;
  typePanne: string;
  scoreIa: number | null;
  analyseIa: string | null;
  categorieIa: string | null;
  dateReclamation: string;
}

interface ReclamationsPageProps {
  user: User;
  onNavigateToOT: (reclamationId: number) => void;
}

export function ReclamationsPage({ user, onNavigateToOT }: ReclamationsPageProps) {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Reclamation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/reclamations");
    const data = await res.json();
    setReclamations(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allowCreateOT = canCreateOT(user.role);
  const filtered = filter
    ? reclamations.filter((r) => r.statut === filter)
    : reclamations;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
            <option value="ferme">Fermé</option>
          </select>
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>
        <span className="text-sm text-gray-500">{filtered.length} réclamation(s)</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p>Aucune réclamation trouvée.</p>
          {user.role === "abonne" && (
            <p className="text-sm mt-2">Utilisez « Soumettre réclamation » pour déclarer une panne.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => (
            <div key={rec.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400">#{rec.id}</span>
                    <StatutBadge statut={rec.statut} />
                    <PrioriteBadge priorite={rec.priorite} />
                    <TypePanneBadge typePanne={rec.typePanne} />
                    {rec.scoreIa != null && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                        <Brain size={12} /> IA {rec.scoreIa}/100
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{rec.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    📍 {rec.localisation} · {format(new Date(rec.dateReclamation), "dd MMM yyyy HH:mm", { locale: fr })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(rec)}
                    className="p-2 rounded-xl border border-gray-100 hover:bg-blue-50 text-blue-600"
                    title="Détails"
                  >
                    <Eye size={16} />
                  </button>
                  {allowCreateOT && rec.statut === "en_attente" && (
                    <button
                      onClick={() => onNavigateToOT(rec.id)}
                      className="btn-primary flex items-center gap-1 text-sm px-4 py-2"
                    >
                      <Plus size={14} /> Créer OT
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Réclamation #${selected?.id}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatutBadge statut={selected.statut} />
              <PrioriteBadge priorite={selected.priorite} />
              <TypePanneBadge typePanne={selected.typePanne} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
              <p className="text-sm text-gray-800 mt-1 p-3 bg-gray-50 rounded-xl">{selected.description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Localisation</p>
              <p className="text-sm text-gray-800 mt-1">{selected.localisation}</p>
            </div>
            {selected.analyseIa && (
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <p className="text-xs font-semibold text-purple-700 uppercase flex items-center gap-1">
                  <Brain size={14} /> Analyse Agent IA
                </p>
                <p className="text-sm text-purple-900 mt-2">{selected.analyseIa}</p>
              </div>
            )}
            {allowCreateOT && selected.statut === "en_attente" && (
              <button
                onClick={() => { onNavigateToOT(selected.id); setSelected(null); }}
                className="btn-primary w-full py-3"
              >
                Créer un ordre de travail
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
