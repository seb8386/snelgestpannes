"use client";

import { LogOut } from "lucide-react";
import type { NavItem, Section } from "@/lib/navigation";

export interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
  nonLues?: number;
}

interface SidebarProps {
  user: User;
  navItems: NavItem[];
  activeSection: Section;
  roleLabel: string;
  onNavigate: (section: Section) => void;
  onLogout: () => void;
}

export function Sidebar({
  user,
  navItems,
  activeSection,
  roleLabel,
  onNavigate,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-72 xl:w-80 shadow-2xl">
      <div className="flex flex-col h-full bg-[#003087]">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
              ⚡
            </div>
            <div>
              <div className="text-white text-sm font-bold">SNEL CVS Kitambo</div>
              <div className="text-blue-200 text-xs">{roleLabel}</div>
            </div>
          </div>
        </div>

        <div className="p-4 mx-3 mt-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
              {user.nom?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user.nom}</div>
              <div className="text-blue-200/70 text-xs truncate">{user.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 mt-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const badge = item.id === "notifications" ? user.nonLues ?? 0 : 0;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-white/15 text-white font-semibold shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-yellow-400" : ""} />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E63329] px-4 py-3 text-sm font-semibold text-white hover:bg-[#c52824] transition"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
