"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Shield,
  HardHat,
  UserCheck,
  UserCircle,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Crown,
} from "lucide-react";
import { ASSIGNABLE_ROLES, canMutateUser } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/navigation";
import { RoleBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: string;
  telephone: string | null;
  actif: boolean;
  createdAt: string;
}

interface Props {
  currentUserId: number;
  currentUserRole: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  superadmin: <Crown size={20} className="text-yellow-600" />,
  administrateur: <Shield size={20} className="text-red-500" />,
  cd: <UserCheck size={20} className="text-blue-500" />,
  get: <HardHat size={20} className="text-yellow-500" />,
  abonne: <UserCircle size={20} className="text-green-500" />,
};

export function UtilisateursPage({ currentUserId, currentUserRole }: Props) {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formNom, setFormNom] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("get");
  const [formPhone, setFormPhone] = useState("");

  const [editNom, setEditNom] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [filterRole, setFilterRole] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/utilisateurs");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/utilisateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formNom,
          email: formEmail,
          motDePasse: formPassword,
          role: formRole,
          telephone: formPhone,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormNom(""); setFormEmail(""); setFormPassword(""); setFormRole("get"); setFormPhone("");
        load();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      await fetch(`/api/utilisateurs/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: editNom, role: editRole, telephone: editPhone }),
      });
      setShowEditModal(false);
      load();
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActif = async (user: Utilisateur) => {
    await fetch(`/api/utilisateurs/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !user.actif }),
    });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch(`/api/utilisateurs/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = filterRole ? users.filter(u => u.role === filterRole) : users;

  const assignableRoles =
    currentUserRole === "superadmin"
      ? ASSIGNABLE_ROLES.superadmin
      : ASSIGNABLE_ROLES.administrateur;

  const roleStats = {
    superadmin: users.filter(u => u.role === "superadmin").length,
    administrateur: users.filter(u => u.role === "administrateur").length,
    cd: users.filter(u => u.role === "cd").length,
    get: users.filter(u => u.role === "get").length,
    abonne: users.filter(u => u.role === "abonne").length,
  };

  const canEditUser = (user: Utilisateur) =>
    canMutateUser(
      { role: currentUserRole, userId: currentUserId },
      { role: user.role, id: user.id }
    );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
          >
            <option value="">Tous les rôles</option>
            <option value="superadmin">Super utilisateurs</option>
            <option value="administrateur">Administrateurs</option>
            <option value="cd">Chefs de Dépannage</option>
            <option value="get">Techniciens GET</option>
            <option value="abonne">Abonnés</option>
          </select>
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { role: "superadmin", label: "Super users", icon: "👑", count: roleStats.superadmin },
          { role: "administrateur", label: "Admins", icon: "🛡️", count: roleStats.administrateur },
          { role: "cd", label: "Chefs de Dépannage", icon: "👔", count: roleStats.cd },
          { role: "get", label: "Techniciens GET", icon: "🔧", count: roleStats.get },
          { role: "abonne", label: "Abonnés", icon: "👤", count: roleStats.abonne },
        ].map((r) => (
          <button
            key={r.role}
            onClick={() => setFilterRole(filterRole === r.role ? "" : r.role)}
            className={`card p-4 text-center transition-all hover:scale-[1.02] ${filterRole === r.role ? "ring-2 ring-blue-900" : ""}`}
          >
            <div className="text-2xl">{r.icon}</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{r.count}</div>
            <div className="text-xs text-gray-500">{r.label}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Créé le</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                          {roleIcons[user.role]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.nom}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.telephone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        user.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.actif ? "✅ Actif" : "❌ Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditNom(user.nom);
                            setEditRole(user.role);
                            setEditPhone(user.telephone || "");
                            setShowEditModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600"
                          title="Modifier"
                        >
                          <Edit size={15} />
                        </button>
                        {user.id !== currentUserId && (
                          <>
                            <button
                              onClick={() => handleToggleActif(user)}
                              className={`p-1.5 rounded-lg ${user.actif ? "hover:bg-red-50 text-red-500" : "hover:bg-green-50 text-green-500"}`}
                              title={user.actif ? "Désactiver" : "Activer"}
                            >
                              {user.actif ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouvel utilisateur" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet *</label>
            <input type="text" value={formNom} onChange={(e) => setFormNom(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
            <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe *</label>
            <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required minLength={6} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rôle *</label>
              <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
                {assignableRoles.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
              <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" placeholder="+243..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Annuler</button>
            <button type="submit" disabled={formLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {formLoading ? <Spinner size="sm" /> : "Créer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal && !!selectedUser} onClose={() => setShowEditModal(false)} title={`Modifier: ${selectedUser?.nom}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet</label>
            <input type="text" value={editNom} onChange={(e) => setEditNom(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rôle</label>
            <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
              {assignableRoles.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
            <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Annuler</button>
            <button type="submit" disabled={formLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {formLoading ? <Spinner size="sm" /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
