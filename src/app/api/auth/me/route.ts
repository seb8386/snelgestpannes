import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { utilisateurs, notifications, abonnes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Récupération de la session utilisateur via le token (cookies)
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Récupération des informations de base de l'utilisateur
    const [user] = await db
      .select({
        id: utilisateurs.id,
        nom: utilisateurs.nom,
        email: utilisateurs.email,
        role: utilisateurs.role,
        telephone: utilisateurs.telephone,
        actif: utilisateurs.actif,
      })
      .from(utilisateurs)
      .where(eq(utilisateurs.id, authUser.userId));

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // 3. Comptage des notifications non lues
    // On utilise count() pour une meilleure performance plutôt que de récupérer tous les objets
    const unreadCount = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.utilisateurId, user.id),
          eq(notifications.lue, false)
        )
      );

    // 4. Récupération optionnelle des infos spécifiques si l'utilisateur est abonné
    let abonneInfo = null;
    if (user.role === "abonne") {
      const [ab] = await db
        .select()
        .from(abonnes)
        .where(eq(abonnes.utilisateurId, user.id));
      abonneInfo = ab || null;
    }

    // 5. Retour de la réponse complète
    return NextResponse.json({
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      nonLues: unreadCount.length, // Nombre de notifications
      abonne: abonneInfo,
    });

  } catch (error) {
    console.error("Erreur API /me:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}