"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCheck, RefreshCw, Info, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  lue: boolean;
  dateEnvoi: string;
}

interface Props {
  onRead: () => void;
}

const typeConfig: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
  info: {
    icon: <Info size={18} className="text-blue-500" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  success: {
    icon: <CheckCircle size={18} className="text-green-500" />,
    bg: "bg-green-50",
    border: "border-green-100",
  },
  urgent: {
    icon: <AlertTriangle size={18} className="text-red-500" />,
    bg: "bg-red-50",
    border: "border-red-100",
  },
  warning: {
    icon: <AlertTriangle size={18} className="text-yellow-500" />,
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
};

export function NotificationsPage({ onRead }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await fetch("/api/notifications/lire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    load();
    onRead();
  };

  const markOneRead = async (id: number) => {
    await fetch("/api/notifications/lire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, lue: true } : n));
    onRead();
  };

  const nonLues = notifications.filter((n) => !n.lue).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Bell size={20} className="text-blue-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {nonLues > 0 && (
              <p className="text-xs text-red-600 font-semibold">{nonLues} non lue(s)</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          {nonLues > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800"
            >
              <CheckCheck size={16} />
              Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-48 text-gray-400">
          <Bell size={40} className="mb-2 opacity-30" />
          <p>Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Non lues first */}
          {notifications.filter(n => !n.lue).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Non lues ({nonLues})
              </h3>
              <div className="space-y-2">
                {notifications.filter(n => !n.lue).map((notif) => {
                  const config = typeConfig[notif.type] || typeConfig.info;
                  return (
                    <div
                      key={notif.id}
                      className={`card p-4 border ${config.border} ${config.bg} relative`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">{notif.titre}</p>
                          <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(notif.dateEnvoi), "dd MMMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        </div>
                        <button
                          onClick={() => markOneRead(notif.id)}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-white/80 text-gray-400 hover:text-gray-600"
                          title="Marquer comme lu"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lues */}
          {notifications.filter(n => n.lue).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">
                Lues
              </h3>
              <div className="space-y-2">
                {notifications.filter(n => n.lue).map((notif) => {
                  const config = typeConfig[notif.type] || typeConfig.info;
                  return (
                    <div
                      key={notif.id}
                      className="card p-4 opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700">{notif.titre}</p>
                          <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(notif.dateEnvoi), "dd MMMM yyyy à HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
