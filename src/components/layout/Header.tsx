"use client";

import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  nonLues: number;
  onNotificationsClick: () => void;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, nonLues, onNotificationsClick, onMenuClick }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="shrink-0 w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} className="text-gray-600" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNotificationsClick}
          className="relative shrink-0 w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <Bell size={18} className="text-gray-600" />
          {nonLues > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold snel-badge-urgent">
              {nonLues > 9 ? "9+" : nonLues}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
