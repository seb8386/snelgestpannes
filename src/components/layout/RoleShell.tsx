"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, User } from "./Sidebar";
import { Header } from "./Header";
import {
  NAV_BY_ROLE,
  ROLE_DASHBOARD_PATH,
  ROLE_LABELS,
  SECTION_TITLES,
  type Role,
  type Section,
} from "@/lib/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { SuperadminOverview } from "@/components/dashboards/SuperadminOverview";
import { AdminOverview } from "@/components/dashboards/AdminOverview";
import { CdOverview } from "@/components/dashboards/CdOverview";
import { GetOverview } from "@/components/dashboards/GetOverview";
import { AbonneOverview } from "@/components/dashboards/AbonneOverview";
import { ReclamationsPage } from "@/components/pages/ReclamationsPage";
import { OrdresTravailPage } from "@/components/pages/OrdresTravailPage";
import { InterventionsPage } from "@/components/pages/InterventionsPage";
import { UtilisateursPage } from "@/components/pages/UtilisateursPage";
import { NotificationsPage } from "@/components/pages/NotificationsPage";
import { IAPage } from "@/components/pages/IAPage";
import { RapportsPage } from "@/components/pages/RapportsPage";
import { NouvelleReclamationForm } from "@/components/pages/NouvelleReclamationForm";

interface RoleShellProps {
  role: Role;
  initialSection?: Section;
}

export function RoleShell({ role, initialSection = "dashboard" }: RoleShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [initialRecId, setInitialRecId] = useState<number | null>(null);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      router.push("/login");
      return null;
    }
    const data = await res.json();
    if (data.role !== role) {
      const path = ROLE_DASHBOARD_PATH[data.role as Role];
      router.push(path || "/login");
      return null;
    }
    const u: User = {
      id: data.id,
      nom: data.nom,
      email: data.email,
      role: data.role,
      nonLues: data.nonLues ?? 0,
    };
    setUser(u);
    return u;
  }, [role, router]);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleNavigate = (section: Section) => {
    setActiveSection(section);
  };

  const handleNavigateToOT = (reclamationId: number) => {
    setInitialRecId(reclamationId);
    setActiveSection("ordres-travail");
  };

  const handleNotificationRead = () => {
    refreshUser();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f6ff]">
        <Spinner />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        if (role === "superadmin") return <SuperadminOverview onNavigate={handleNavigate} />;
        if (role === "administrateur") return <AdminOverview onNavigate={handleNavigate} />;
        if (role === "cd") return <CdOverview onNavigate={handleNavigate} />;
        if (role === "get") return <GetOverview onNavigate={handleNavigate} />;
        return <AbonneOverview onNavigate={handleNavigate} />;
      case "reclamations":
        return (
          <ReclamationsPage
            user={user}
            onNavigateToOT={handleNavigateToOT}
          />
        );
      case "nouvelle-reclamation":
        return <NouvelleReclamationForm onSuccess={() => setActiveSection("reclamations")} />;
      case "ordres-travail":
        return (
          <OrdresTravailPage
            user={user}
            initialReclamationId={initialRecId}
            onClearInitialRec={() => setInitialRecId(null)}
          />
        );
      case "interventions":
        return <InterventionsPage user={{ role: user.role, id: user.id }} />;
      case "utilisateurs":
        return <UtilisateursPage currentUserId={user.id} currentUserRole={user.role} />;
      case "ia":
        return <IAPage />;
      case "rapports":
        return <RapportsPage />;
      case "notifications":
        return <NotificationsPage onRead={handleNotificationRead} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6ff]">
      <div className="lg:flex">
        <div className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
          <Sidebar
            user={user}
            navItems={NAV_BY_ROLE[role]}
            activeSection={activeSection}
            roleLabel={ROLE_LABELS[role]}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </div>

        <div className="flex-1 lg:ml-72 xl:ml-80 min-w-0">
          <Header
            title={SECTION_TITLES[activeSection]}
            subtitle={`${ROLE_LABELS[role]} · ${user.nom}`}
            nonLues={user.nonLues ?? 0}
            onNotificationsClick={() => handleNavigate("notifications")}
          />
          <main className="px-4 py-6 lg:px-8 lg:py-8 animate-fade-in">{renderSection()}</main>
        </div>
      </div>
    </div>
  );
}
