import { NextResponse } from "next/server";
import { analyserReclamation } from "@/lib/ia";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, stats, description } = body;

    // --- 1. Analyse de panne (IA) ---
    if (description && typeof description === "string") {
      // DEBUG : Vérification de la clé avant l'appel
      const hasKey = !!process.env.OPENROUTER_API_KEY;
      console.log("Vérification clé API dans route.ts :", hasKey ? "PRÉSENTE" : "ABSENTE");

      const resultat = await analyserReclamation(description);
      
      // On renvoie directement l'objet, pas besoin de le wrapper dans { analyse: ... }
      return NextResponse.json(resultat);
    }

    // --- 2. Analyse pour les rôles (Dashboard) ---
    const pannesActives = stats?.pannesActives ?? 0;
    const ordresAttente = stats?.ordresTravail?.enAttente ?? 0;
    const tauxResolution = stats?.tauxResolution ?? 0;

    let resultat = "Analyse personnalisée pour votre rôle.";

    if (role === "cd") {
      resultat = ordresAttente > 5
        ? "Attention : trop d'OT en attente. Mobilisez une équipe immédiatement."
        : "Les ordres de travail sont sous contrôle. Maintenez le rythme.";
    } else if (role === "administrateur" || role === "superadmin") {
      if (pannesActives > 12 || tauxResolution < 80) {
        resultat = "Alerte globale : le réseau montre des tensions. Renforcez la supervision et priorisez les interventions critiques.";
      } else {
        resultat = "Analyse globale : le système est stable, poursuivez le suivi et maintenez le niveau de service.";
      }
    } else if (role === "get") {
      resultat = "Plan de terrain : concentrez-vous sur les interventions rapides et les zones à haute visibilité.";
    } else if (role === "abonne") {
      resultat = "Synthèse abonné : votre signalement est bien pris en compte. Notre équipe travaille à la solution.";
    }

    return NextResponse.json({ resultat });
    
  } catch (error) {
    console.error("Erreur API Route IA:", error);
    return NextResponse.json(
      { error: "Échec de l'analyse automatique" },
      { status: 500 }
    );
  }
}