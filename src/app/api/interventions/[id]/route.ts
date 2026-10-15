import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interventions, ordresTravail, reclamations, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canCreateIntervention } from "@/lib/roles";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!canCreateIntervention(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const intId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.rapport !== undefined) updateData.rapport = body.rapport;
    if (body.resultat !== undefined) updateData.resultat = body.resultat;
    if (body.materielsUtilises !== undefined) updateData.materielsUtilises = body.materielsUtilises;
    if (body.statut) {
      updateData.statut = body.statut;
      if (body.statut === "terminee") {
        updateData.dateFin = new Date();
      }
    }

    await db
      .update(interventions)
      .set(updateData)
      .where(eq(interventions.id, intId));

    const [updated] = await db
      .select()
      .from(interventions)
      .where(eq(interventions.id, intId));

    // If completed, close OT and resolve reclamation
    if (body.statut === "terminee") {
      const [ot] = await db
        .select()
        .from(ordresTravail)
        .where(eq(ordresTravail.id, updated.otId));

      if (ot) {
        await db
          .update(ordresTravail)
          .set({ statut: "clos", updatedAt: new Date() })
          .where(eq(ordresTravail.id, ot.id));

        const [rec] = await db
          .select()
          .from(reclamations)
          .where(eq(reclamations.id, ot.reclamationId));

        if (rec) {
          await db
            .update(reclamations)
            .set({ statut: "resolu", dateResolution: new Date(), updatedAt: new Date() })
            .where(eq(reclamations.id, rec.id));

          await db.insert(notifications).values({
            utilisateurId: rec.utilisateurId,
            titre: "✅ Panne résolue",
            message: `Votre réclamation #${rec.id} a été résolue. ${body.resultat || "Intervention terminée avec succès."}`,
            type: "success",
          });
        }
      }
    }

    return NextResponse.json({ success: true, intervention: updated });
  } catch (error) {
    console.error("PATCH intervention error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
