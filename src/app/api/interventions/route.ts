import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interventions, ordresTravail, reclamations, utilisateurs, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canCreateIntervention } from "@/lib/roles";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const results = await db
      .select({
        id: interventions.id,
        otId: interventions.otId,
        technicienId: interventions.technicienId,
        rapport: interventions.rapport,
        resultat: interventions.resultat,
        statut: interventions.statut,
        materielsUtilises: interventions.materielsUtilises,
        dateIntervention: interventions.dateIntervention,
        dateFin: interventions.dateFin,
        localisationRec: reclamations.localisation,
        descriptionRec: reclamations.description,
        nomTechnicien: utilisateurs.nom,
        reclamationId: ordresTravail.reclamationId,
        utilisateurIdRec: reclamations.utilisateurId,
      })
      .from(interventions)
      .leftJoin(ordresTravail, eq(interventions.otId, ordresTravail.id))
      .leftJoin(reclamations, eq(ordresTravail.reclamationId, reclamations.id))
      .leftJoin(utilisateurs, eq(interventions.technicienId, utilisateurs.id))
      .orderBy(desc(interventions.dateIntervention));

    let filtered = results;
    if (authUser.role === "abonne") {
      filtered = results.filter((r) => r.utilisateurIdRec === authUser.userId);
    } else if (authUser.role === "get") {
      filtered = results.filter((r) => r.technicienId === authUser.userId);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("GET interventions error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!canCreateIntervention(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { otId, rapport, resultat, materielsUtilises, statut } = body;

    if (!otId) {
      return NextResponse.json({ error: "OT ID requis" }, { status: 400 });
    }

    const [ot] = await db
      .select()
      .from(ordresTravail)
      .where(eq(ordresTravail.id, otId));

    if (!ot) {
      return NextResponse.json({ error: "Ordre de travail introuvable" }, { status: 404 });
    }

    const [insertResult] = await db
      .insert(interventions)
      .values({
        otId,
        technicienId: authUser.userId,
        rapport: rapport || null,
        resultat: resultat || null,
        materielsUtilises: materielsUtilises || null,
        statut: statut || "planifiee",
        dateFin: statut === "terminee" ? new Date() : null,
      });

    const newInterventionId = typeof insertResult.insertId === "number" ? insertResult.insertId : null;
    if (!newInterventionId) {
      return NextResponse.json({ error: "Impossible de créer l'intervention" }, { status: 500 });
    }

    const [newIntervention] = await db
      .select()
      .from(interventions)
      .where(eq(interventions.id, newInterventionId));

    // If intervention is complete, update reclamation
    if (statut === "terminee") {
      const [rec] = await db
        .select()
        .from(reclamations)
        .where(eq(reclamations.id, ot.reclamationId));

      if (rec) {
        await db
          .update(reclamations)
          .set({ statut: "resolu", dateResolution: new Date(), updatedAt: new Date() })
          .where(eq(reclamations.id, ot.reclamationId));

        await db
          .update(ordresTravail)
          .set({ statut: "clos", updatedAt: new Date() })
          .where(eq(ordresTravail.id, otId));

        // Notify abonné
        await db.insert(notifications).values({
          utilisateurId: rec.utilisateurId,
          titre: "✅ Panne résolue",
          message: `Votre réclamation #${rec.id} a été résolue. ${resultat || "Intervention terminée avec succès."}`,
          type: "success",
        });
      }
    }

    return NextResponse.json({ success: true, intervention: newIntervention });
  } catch (error) {
    console.error("POST intervention error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
