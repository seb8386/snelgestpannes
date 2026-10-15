"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sidebar, User } from "./Sidebar";
import { Header } from "./Header";
import { NAV_BY_ROLE, ROLE_LABELS, SECTION_TITLES, type Role, type Section } from "@/lib/navigation";

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const role = user.role as Role;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleNavigate = (section: Section) => {
    setActiveSection(section);
    const base =
      role === "superadmin"
        ? "/dashboard/super"
        : role === "administrateur"
          ? "/dashboard/admin"
          : `/dashboard/${role}`;
    if (section === "dashboard") {
      router.push(base);
    }
  };

  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.abonne;

  return (
    <div className="min-h-screen bg-[#f3f6ff]">
      <div className="lg:flex">
        <div className="hidden lg:block lg:w-72 xl:w-80">
          <Sidebar
            user={user}
            navItems={navItems}
            activeSection={activeSection}
            roleLabel={ROLE_LABELS[role] ?? user.role}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </div>

        <div className="flex-1 lg:ml-72 xl:ml-80">
          <Header
            title={SECTION_TITLES[activeSection]}
            subtitle={`Bienvenue ${user.nom}`}
            nonLues={user.nonLues ?? 0}
            onNotificationsClick={() => handleNavigate("notifications")}
          />
          <main className="px-6 py-6 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
