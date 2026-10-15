import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ordresTravail, reclamations, utilisateurs, equipes, notifications, membresEquipe } from "@/db/schema";
import { eq, or, isNull, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canCreateOT } from "@/lib/roles";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const baseQuery = db
      .select({
        id: ordresTravail.id,
        reclamationId: ordresTravail.reclamationId,
        dateCreation: ordresTravail.dateCreation,
        statut: ordresTravail.statut,
        urgence: ordresTravail.urgence,
        instructions: ordresTravail.instructions,
        equipeId: ordresTravail.equipeId,
        dateEcheance: ordresTravail.dateEcheance,
        creePar: ordresTravail.creePar,
        descriptionRec: reclamations.description,
        localisationRec: reclamations.localisation,
        prioriteRec: reclamations.priorite,
        nomEquipe: equipes.nom,
        nomCreateur: utilisateurs.nom,
      })
      .from(ordresTravail)
      .leftJoin(reclamations, eq(ordresTravail.reclamationId, reclamations.id))
      .leftJoin(equipes, eq(ordresTravail.equipeId, equipes.id))
      .leftJoin(utilisateurs, eq(ordresTravail.creePar, utilisateurs.id));

    const query = authUser.role === "get"
      ? baseQuery
          .leftJoin(membresEquipe, eq(ordresTravail.equipeId, membresEquipe.equipeId))
          .where(
            or(
              isNull(ordresTravail.equipeId),
              eq(membresEquipe.utilisateurId, authUser.userId)
            )
          )
      : authUser.role === "abonne"
      ? baseQuery.where(eq(reclamations.utilisateurId, authUser.userId))
      : baseQuery;

    const ots = await query.orderBy(desc(ordresTravail.dateCreation));

    return NextResponse.json(ots);
  } catch (error) {
    console.error("GET OTs error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !canCreateOT(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { reclamationId, urgence, instructions, equipeId, dateEcheance } = body;

    if (!reclamationId) {
      return NextResponse.json({ error: "ReclamationId requis" }, { status: 400 });
    }

    const [rec] = await db
      .select()
      .from(reclamations)
      .where(eq(reclamations.id, reclamationId));

    if (!rec) {
      return NextResponse.json({ error: "Réclamation introuvable" }, { status: 404 });
    }

    const [insertResult] = await db
      .insert(ordresTravail)
      .values({
        reclamationId,
        creePar: authUser.userId,
        urgence: urgence || "normal",
        instructions: instructions || null,
        equipeId: equipeId || null,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
        statut: equipeId ? "affecte" : "valide",
      });

    const newOTId = typeof insertResult.insertId === "number" ? insertResult.insertId : null;
    if (!newOTId) {
      return NextResponse.json(
        { error: "Impossible de créer l'ordre de travail" },
        { status: 500 }
      );
    }

    // Update reclamation status
    await db
      .update(reclamations)
      .set({ statut: "en_cours", updatedAt: new Date() })
      .where(eq(reclamations.id, reclamationId));

    // Notify equipe members if assigned
    if (equipeId) {
      const [eq_] = await db
        .select()
        .from(equipes)
        .where(eq(equipes.id, equipeId));

      if (eq_) {
        const members = await db
          .select({ userId: utilisateurs.id })
          .from(utilisateurs)
          .where(eq(utilisateurs.role, "get"));

        for (const member of members) {
          await db.insert(notifications).values({
            utilisateurId: member.userId,
            titre: "Nouvel ordre de travail",
            message: `Ordre de travail #${newOTId} assigné. Localisation: ${rec.localisation}. Urgence: ${urgence?.toUpperCase() || "NORMAL"}`,
            type: urgence === "critique" ? "urgent" : "info",
          });
        }
      }
    }

    // Notify abonné
    await db.insert(notifications).values({
      utilisateurId: rec.utilisateurId,
      titre: "Réclamation en cours",
      message: `Un ordre de travail #${newOTId} a été généré pour votre réclamation. Un technicien sera dépêché.`,
      type: "info",
    });

    return NextResponse.json({ success: true, ordreTravailId: newOTId });
  } catch (error) {
    console.error("POST OT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
