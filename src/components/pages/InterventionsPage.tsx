"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  HardHat,
  Calendar,
  Edit,
  FileText,
  CheckCircle,
  Printer,
} from "lucide-react";
import { StatutBadge } from "@/components/ui/Badge";
import { canCreateIntervention } from "@/lib/roles";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { BonDepannagePrint } from "@/components/print/BonDepannagePrint";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Intervention {
  id: number;
  otId: number;
  technicienId: number | null;
  rapport: string | null;
  resultat: string | null;
  statut: string;
  materielsUtilises: string | null;
  dateIntervention: string;
  dateFin: string | null;
  localisationRec: string | null;
  descriptionRec: string | null;
  typePanneRec: string | null;
  nomTechnicien: string | null;
  reclamationId: number | null;
  utilisateurIdRec: number | null;
}

interface OT {
  id: number;
  descriptionRec: string | null;
  statut: string;
}

interface Props {
  user: { role: string; id: number };
}

export function InterventionsPage({ user }: Props) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [ots, setOTs] = useState<OT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInt, setSelectedInt] = useState<Intervention | null>(null);
  const [printInt, setPrintInt] = useState<Intervention | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formOTId, setFormOTId] = useState("");
  const [formRapport, setFormRapport] = useState("");
  const [formResultat, setFormResultat] = useState("");
  const [formMateriels, setFormMateriels] = useState("");
  const [formStatut, setFormStatut] = useState("planifiee");

  const [editRapport, setEditRapport] = useState("");
  const [editResultat, setEditResultat] = useState("");
  const [editMateriels, setEditMateriels] = useState("");
  const [editStatut, setEditStatut] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [intRes, otRes] = await Promise.all([
      fetch("/api/interventions"),
      fetch("/api/ordres-travail"),
    ]);
    const [intData, otData] = await Promise.all([intRes.json(), otRes.json()]);
    setInterventions(Array.isArray(intData) ? intData : []);
    setOTs(Array.isArray(otData) ? otData.filter((o: OT) => o.statut !== "clos") : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otId: parseInt(formOTId),
          rapport: formRapport,
          resultat: formResultat,
          materielsUtilises: formMateriels,
          statut: formStatut,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormOTId(""); setFormRapport(""); setFormResultat(""); setFormMateriels(""); setFormStatut("planifiee");
        load();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInt) return;
    setFormLoading(true);
    try {
      await fetch(`/api/interventions/${selectedInt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rapport: editRapport,
          resultat: editResultat,
          materielsUtilises: editMateriels,
          statut: editStatut,
        }),
      });
      setShowEditModal(false);
      load();
    } finally {
      setFormLoading(false);
    }
  };

  const canCreate = canCreateIntervention(user.role);

  const statutIcon: Record<string, React.ReactNode> = {
    planifiee: <Calendar size={16} className="text-gray-500" />,
    en_cours: <HardHat size={16} className="text-blue-500" />,
    terminee: <CheckCircle size={16} className="text-green-500" />,
    annulee: <RefreshCw size={16} className="text-red-500" />,
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <span className="text-sm text-gray-500">{interventions.length} interventions</span>
        </div>
        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nouvelle intervention
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Planifiées", value: interventions.filter(i => i.statut === "planifiee").length, color: "text-gray-600" },
          { label: "En cours", value: interventions.filter(i => i.statut === "en_cours").length, color: "text-blue-600" },
          { label: "Terminées", value: interventions.filter(i => i.statut === "terminee").length, color: "text-green-600" },
          { label: "Annulées", value: interventions.filter(i => i.statut === "annulee").length, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : interventions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-48 text-gray-400">
          <HardHat size={40} className="mb-2 opacity-30" />
          <p>Aucune intervention enregistrée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interventions.map((intervention) => (
            <div key={intervention.id} className="card p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    {statutIcon[intervention.statut]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">INT #{intervention.id}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">OT #{intervention.otId}</span>
                      <StatutBadge statut={intervention.statut} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {intervention.descriptionRec || "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      📍 {intervention.localisationRec || "—"}
                    </p>
                    {intervention.nomTechnicien && (
                      <p className="text-xs text-blue-600 mt-1">
                        🔧 Technicien: {intervention.nomTechnicien}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setPrintInt(intervention)}
                    className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 border border-gray-100"
                    title="Imprimer le bon de dépannage"
                  >
                    <Printer size={15} />
                  </button>
                  {canCreate && intervention.statut !== "terminee" && (
                    <button
                      onClick={() => {
                        setSelectedInt(intervention);
                        setEditRapport(intervention.rapport || "");
                        setEditResultat(intervention.resultat || "");
                        setEditMateriels(intervention.materielsUtilises || "");
                        setEditStatut(intervention.statut);
                        setShowEditModal(true);
                      }}
                      className="p-2 rounded-xl hover:bg-yellow-50 text-yellow-600 border border-gray-100"
                    >
                      <Edit size={15} />
                    </button>
                  )}
                </div>
              </div>

              {(intervention.rapport || intervention.resultat) && (
                <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {intervention.rapport && (
                    <div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                        <FileText size={12} /> Rapport
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {intervention.rapport}
                      </p>
                    </div>
                  )}
                  {intervention.resultat && (
                    <div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                        <CheckCircle size={12} /> Résultat
                      </div>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                        {intervention.resultat}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {intervention.materielsUtilises && (
                <div className="mt-2 text-xs text-gray-500">
                  🔩 Matériels: {intervention.materielsUtilises}
                </div>
              )}

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>📅 {format(new Date(intervention.dateIntervention), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
                {intervention.dateFin && (
                  <span>✅ Fin: {format(new Date(intervention.dateFin), "dd/MM/yyyy HH:mm", { locale: fr })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouvelle intervention" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ordre de travail *</label>
            <select value={formOTId} onChange={(e) => setFormOTId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required>
              <option value="">Sélectionner un OT</option>
              {ots.map((ot) => (
                <option key={ot.id} value={ot.id}>OT #{ot.id} — {ot.descriptionRec?.substring(0, 50)}...</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
            <select value={formStatut} onChange={(e) => setFormStatut(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rapport d'intervention</label>
            <textarea value={formRapport} onChange={(e) => setFormRapport(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none" rows={4} placeholder="Décrivez les travaux effectués..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Résultat</label>
            <textarea value={formResultat} onChange={(e) => setFormResultat(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none" rows={3} placeholder="Résultat de l'intervention..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Matériels utilisés</label>
            <input type="text" value={formMateriels} onChange={(e) => setFormMateriels(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" placeholder="ex: câbles, disjoncteurs, transformateur..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Annuler</button>
            <button type="submit" disabled={formLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {formLoading ? <Spinner size="sm" /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal && !!selectedInt} onClose={() => setShowEditModal(false)} title={`Modifier intervention #${selectedInt?.id}`} size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
            <select value={editStatut} onChange={(e) => setEditStatut(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée ✅</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rapport</label>
            <textarea value={editRapport} onChange={(e) => setEditRapport(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none" rows={4} placeholder="Rapport d'intervention..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Résultat</label>
            <textarea value={editResultat} onChange={(e) => setEditResultat(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none" rows={3} placeholder="Résultat..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Matériels utilisés</label>
            <input type="text" value={editMateriels} onChange={(e) => setEditMateriels(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" placeholder="Matériels..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Annuler</button>
            <button type="submit" disabled={formLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {formLoading ? <Spinner size="sm" /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {printInt && <BonDepannagePrint data={printInt} onClose={() => setPrintInt(null)} />}
    </div>
  );
}
