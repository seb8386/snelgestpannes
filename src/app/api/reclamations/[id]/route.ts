import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reclamations, utilisateurs, notifications, ordresTravail } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canDeleteAnyReclamation, canPatchReclamation } from "@/lib/roles";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const recId = parseInt(id);

    const [rec] = await db
      .select({
        id: reclamations.id,
        description: reclamations.description,
        localisation: reclamations.localisation,
        typePanne: reclamations.typePanne,
        statut: reclamations.statut,
        priorite: reclamations.priorite,
        scoreIA: reclamations.scoreIa,
        analyseIA: reclamations.analyseIa,
        categorieIA: reclamations.categorieIa,
        dateReclamation: reclamations.dateReclamation,
        dateResolution: reclamations.dateResolution,
        utilisateurId: reclamations.utilisateurId,
        nomUtilisateur: utilisateurs.nom,
        emailUtilisateur: utilisateurs.email,
      })
      .from(reclamations)
      .leftJoin(utilisateurs, eq(reclamations.utilisateurId, utilisateurs.id))
      .where(eq(reclamations.id, recId));

    if (!rec) {
      return NextResponse.json({ error: "Réclamation introuvable" }, { status: 404 });
    }

    // Check access
    if (authUser.role === "abonne" && rec.utilisateurId !== authUser.userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Get related OT
    const ots = await db
      .select()
      .from(ordresTravail)
      .where(eq(ordresTravail.reclamationId, recId));

    return NextResponse.json({ ...rec, ordresTravail: ots });
  } catch (error) {
    console.error("GET reclamation error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!canPatchReclamation(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const recId = parseInt(id);
    const body = await request.json();

    const [existing] = await db
      .select()
      .from(reclamations)
      .where(eq(reclamations.id, recId));

    if (!existing) {
      return NextResponse.json({ error: "Réclamation introuvable" }, { status: 404 });
    }

    const updateData: Partial<typeof existing> = {
      updatedAt: new Date(),
    };

    if (body.statut) updateData.statut = body.statut;
    if (body.priorite) updateData.priorite = body.priorite;
    if (body.statut === "resolu") updateData.dateResolution = new Date();

    await db
      .update(reclamations)
      .set(updateData)
      .where(eq(reclamations.id, recId));

    const [updated] = await db
      .select()
      .from(reclamations)
      .where(eq(reclamations.id, recId));

    // Notify user
    if (body.statut) {
      const statusMessages: Record<string, string> = {
        en_cours: "Votre réclamation est en cours de traitement",
        resolu: "✅ Votre réclamation a été résolue avec succès",
        ferme: "Votre réclamation a été fermée",
      };
      if (statusMessages[body.statut]) {
        await db.insert(notifications).values({
          utilisateurId: existing.utilisateurId,
          titre: "Mise à jour réclamation",
          message: `Réclamation #${recId}: ${statusMessages[body.statut]}`,
          type: body.statut === "resolu" ? "success" : "info",
        });
      }
    }

    return NextResponse.json({ success: true, reclamation: updated });
  } catch (error) {
    console.error("PATCH reclamation error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const recId = parseInt(id);

    const [existing] = await db
      .select()
      .from(reclamations)
      .where(eq(reclamations.id, recId));

    if (!existing) {
      return NextResponse.json({ error: "Réclamation introuvable" }, { status: 404 });
    }

    if (authUser.role === "abonne") {
      if (existing.utilisateurId !== authUser.userId) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      if (existing.statut !== "en_attente") {
        return NextResponse.json({ error: "Impossible de supprimer une réclamation déjà prise en charge" }, { status: 400 });
      }
    } else if (!canDeleteAnyReclamation(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await db.delete(reclamations).where(eq(reclamations.id, recId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE reclamation error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
