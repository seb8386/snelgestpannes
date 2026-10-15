import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { equipes, utilisateurs, membresEquipe } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canManageEquipes } from "@/lib/roles";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const allEquipes = await db
      .select({
        id: equipes.id,
        nom: equipes.nom,
        specialite: equipes.specialite,
        disponible: equipes.disponible,
        responsableId: equipes.responsableId,
        nomResponsable: utilisateurs.nom,
        createdAt: equipes.createdAt,
      })
      .from(equipes)
      .leftJoin(utilisateurs, eq(equipes.responsableId, utilisateurs.id));

    return NextResponse.json(allEquipes);
  } catch (error) {
    console.error("GET equipes error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !canManageEquipes(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { nom, specialite, responsableId } = body;

    if (!nom) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const [insertResult] = await db
      .insert(equipes)
      .values({
        nom,
        specialite: specialite || null,
        responsableId: responsableId || null,
      });

    const newEquipeId = typeof insertResult.insertId === "number" ? insertResult.insertId : null;
    if (!newEquipeId) {
      return NextResponse.json({ error: "Impossible de créer l'équipe" }, { status: 500 });
    }

    const [newEquipe] = await db
      .select()
      .from(equipes)
      .where(eq(equipes.id, newEquipeId));

    return NextResponse.json({ success: true, equipe: newEquipe });
  } catch (error) {
    console.error("POST equipe error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
