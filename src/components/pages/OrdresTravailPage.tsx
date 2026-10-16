"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Wrench,
  Calendar,
  AlertTriangle,
  Edit,
  Eye,
  Printer,
} from "lucide-react";
import { StatutBadge, PrioriteBadge } from "@/components/ui/Badge";
import { canCreateOT } from "@/lib/roles";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { OrdreTravailPrint } from "@/components/print/OrdreTravailPrint";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OT {
  id: number;
  reclamationId: number;
  dateCreation: string;
  statut: string;
  urgence: string;
  instructions: string | null;
  equipeId: number | null;
  dateEcheance: string | null;
  creePar: number;
  descriptionRec: string | null;
  localisationRec: string | null;
  prioriteRec: string | null;
  nomEquipe: string | null;
  nomCreateur: string | null;
}

interface Reclamation {
  id: number;
  description: string;
  localisation: string;
  statut: string;
}

interface Equipe {
  id: number;
  nom: string;
  specialite: string | null;
  disponible: boolean;
}

interface Props {
  user: { role: string };
  initialReclamationId?: number | null;
  onClearInitialRec?: () => void;
}

const urgenceColors: Record<string, string> = {
  normal: "text-gray-600 bg-gray-100",
  urgent: "text-orange-700 bg-orange-100",
  critique: "text-red-700 bg-red-100",
};

const urgenceLabels: Record<string, string> = {
  normal: "Normal",
  urgent: "⚠️ Urgent",
  critique: "🚨 Critique",
};

export function OrdresTravailPage({ user, initialReclamationId, onClearInitialRec }: Props) {
  const [ots, setOTs] = useState<OT[]>([]);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOT, setSelectedOT] = useState<OT | null>(null);
  const [printOT, setPrintOT] = useState<OT | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formRecId, setFormRecId] = useState(initialReclamationId?.toString() || "");
  const [formUrgence, setFormUrgence] = useState("normal");
  const [formInstructions, setFormInstructions] = useState("");
  const [formEquipeId, setFormEquipeId] = useState("");
  const [formEcheance, setFormEcheance] = useState("");

  const [editEquipeId, setEditEquipeId] = useState("");
  const [editStatut, setEditStatut] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [otsRes, recsRes, eqRes] = await Promise.all([
      fetch("/api/ordres-travail"),
      fetch("/api/reclamations"),
      fetch("/api/equipes"),
    ]);
    const [otsData, recsData, eqData] = await Promise.all([
      otsRes.json(),
      recsRes.json(),
      eqRes.json(),
    ]);
    setOTs(Array.isArray(otsData) ? otsData : []);
    setReclamations(Array.isArray(recsData) ? recsData.filter((r: Reclamation) => r.statut !== "resolu") : []);
    setEquipes(Array.isArray(eqData) ? eqData : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (initialReclamationId) {
      setFormRecId(initialReclamationId.toString());
      setShowAddModal(true);
      onClearInitialRec?.();
    }
  }, [initialReclamationId, onClearInitialRec]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/ordres-travail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reclamationId: parseInt(formRecId),
          urgence: formUrgence,
          instructions: formInstructions,
          equipeId: formEquipeId ? parseInt(formEquipeId) : null,
          dateEcheance: formEcheance || null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormRecId("");
        setFormUrgence("normal");
        setFormInstructions("");
        setFormEquipeId("");
        setFormEcheance("");
        load();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOT) return;
    setFormLoading(true);
    try {
      await fetch(`/api/ordres-travail/${selectedOT.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipeId: editEquipeId ? parseInt(editEquipeId) : null,
          statut: editStatut || undefined,
        }),
      });
      setShowEditModal(false);
      load();
    } finally {
      setFormLoading(false);
    }
  };

  const canCreate = canCreateOT(user.role);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <span className="text-sm text-gray-500">{ots.length} ordres de travail</span>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Créer un OT
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Validés", value: ots.filter(o => o.statut === "valide").length, color: "text-blue-600" },
          { label: "Affectés", value: ots.filter(o => o.statut === "affecte").length, color: "text-orange-600" },
          { label: "Clos", value: ots.filter(o => o.statut === "clos").length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : ots.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-48 text-gray-400">
          <Wrench size={40} className="mb-2 opacity-30" />
          <p>Aucun ordre de travail</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ots.map((ot) => (
            <div key={ot.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-400">OT #{ot.id}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <StatutBadge statut={ot.statut} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${urgenceColors[ot.urgence]}`}>
                      {urgenceLabels[ot.urgence]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setSelectedOT(ot); setShowDetailModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => setPrintOT(ot)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                    title="Imprimer l'ordre de travail"
                  >
                    <Printer size={15} />
                  </button>
                  {canCreate && (
                    <button
                      onClick={() => {
                        setSelectedOT(ot);
                        setEditEquipeId(ot.equipeId?.toString() || "");
                        setEditStatut(ot.statut);
                        setShowEditModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600"
                    >
                      <Edit size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-900 font-medium line-clamp-2">
                  {ot.descriptionRec || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">📍 {ot.localisationRec || "—"}</p>
              </div>

              {ot.prioriteRec && (
                <PrioriteBadge priorite={ot.prioriteRec} />
              )}

              <div className="pt-2 border-t border-gray-50 space-y-1.5">
                {ot.nomEquipe && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Wrench size={12} />
                    <span>{ot.nomEquipe}</span>
                  </div>
                )}
                {ot.dateEcheance && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Échéance: {format(new Date(ot.dateEcheance), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>Créé le {format(new Date(ot.dateCreation), "dd/MM/yyyy", { locale: fr })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Créer un ordre de travail" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Réclamation *
            </label>
            <select
              value={formRecId}
              onChange={(e) => setFormRecId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
              required
            >
              <option value="">Sélectionner une réclamation</option>
              {reclamations.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} — {r.description.substring(0, 60)}...
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Urgence</label>
              <select
                value={formUrgence}
                onChange={(e) => setFormUrgence(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critique">Critique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Équipe GET</label>
              <select
                value={formEquipeId}
                onChange={(e) => setFormEquipeId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Non assignée</option>
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom} {eq.disponible ? "✅" : "❌"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date d'échéance</label>
            <input
              type="datetime-local"
              value={formEcheance}
              onChange={(e) => setFormEcheance(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instructions</label>
            <textarea
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none"
              rows={4}
              placeholder="Instructions pour l'équipe technique..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
              Annuler
            </button>
            <button type="submit" disabled={formLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {formLoading ? <Spinner size="sm" /> : "Créer l'OT"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal && !!selectedOT} onClose={() => setShowDetailModal(false)} title={`Ordre de travail #${selectedOT?.id}`} size="lg">
        {selectedOT && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase">Statut</label>
                <div className="mt-1"><StatutBadge statut={selectedOT.statut} /></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase">Urgence</label>
                <p className={`mt-1 text-sm font-bold ${urgenceColors[selectedOT.urgence]?.split(" ")[0]}`}>
                  {urgenceLabels[selectedOT.urgence]}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase">Équipe</label>
                <p className="text-sm text-gray-900 mt-1">{selectedOT.nomEquipe || "Non assignée"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase">Créé par</label>
                <p className="text-sm text-gray-900 mt-1">{selectedOT.nomCreateur || "—"}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase">Réclamation</label>
              <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-xl">
                {selectedOT.descriptionRec || "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">📍 {selectedOT.localisationRec}</p>
            </div>

            {selectedOT.instructions && (
              <div>
                <label className="text-xs text-gray-500 font-semibold uppercase">Instructions</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                  {selectedOT.instructions}
                </p>
              </div>
            )}

            {selectedOT.dateEcheance && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertTriangle size={16} />
                <span>Échéance: {format(new Date(selectedOT.dateEcheance), "dd MMMM yyyy à HH:mm", { locale: fr })}</span>
              </div>
            )}

            <button
              onClick={() => setPrintOT(selectedOT)}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Printer size={15} /> Imprimer le formulaire officiel
            </button>
          </div>
        )}
      </Modal>

      {/* Edit Modal — Valider OT & Affecter GET */}
      <Modal isOpen={showEditModal && !!selectedOT} onClose={() => setShowEditModal(false)} title={`Valider / Affecter OT #${selectedOT?.id}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut (validation)</label>
            <select
              value={editStatut}
              onChange={(e) => setEditStatut(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
            >
              <option value="valide">Validé — en attente d'affectation</option>
              <option value="affecte">Affecté à une équipe GET</option>
              <option value="clos">Clos — intervention terminée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Affecter à une équipe GET</label>
            <select
              value={editEquipeId}
              onChange={(e) => setEditEquipeId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
            >
              <option value="">Non assignée</option>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nom} {eq.disponible ? "✅" : "❌"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
              Annuler
            </button>
            <button type="submit" disabled={formLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {formLoading ? <Spinner size="sm" /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {printOT && <OrdreTravailPrint data={printOT} onClose={() => setPrintOT(null)} />}
    </div>
  );
}
