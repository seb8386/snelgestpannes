"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  nonLues: number;
  onNotificationsClick: () => void;
}

export function Header({ title, subtitle, nonLues, onNotificationsClick }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNotificationsClick}
          className="relative w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
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
