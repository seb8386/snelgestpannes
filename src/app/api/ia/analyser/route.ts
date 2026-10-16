import { NextResponse } from "next/server";
import { analyserReclamation, genererSyntheseRole } from "@/lib/ia";
import { getAuthUser } from "@/lib/auth";
import { isRole } from "@/lib/roles";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { stats, description } = body;

    // --- 1. Analyse de panne (IA) ---
    if (description && typeof description === "string") {
      const resultat = await analyserReclamation(description);
      // On renvoie directement l'objet, pas besoin de le wrapper dans { analyse: ... }
      return NextResponse.json(resultat);
    }

    // --- 2. Synthèse IA pour le tableau de bord (toujours le rôle de l'utilisateur connecté) ---
    const role = isRole(authUser.role) ? authUser.role : "abonne";
    const resultat = await genererSyntheseRole(role, stats ?? {});

    return NextResponse.json({ resultat });

  } catch (error) {
    console.error("Erreur API Route IA:", error);
    return NextResponse.json(
      { error: "Échec de l'analyse automatique" },
      { status: 500 }
    );
  }
}