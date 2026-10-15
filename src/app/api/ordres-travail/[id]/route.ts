import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ordresTravail, reclamations, equipes, utilisateurs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canCreateOT } from "@/lib/roles";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !canCreateOT(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const otId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.statut) updateData.statut = body.statut;
    if (body.urgence) updateData.urgence = body.urgence;
    if (body.equipeId !== undefined) {
      updateData.equipeId = body.equipeId;
      if (body.equipeId) updateData.statut = "affecte";
    }
    if (body.instructions) updateData.instructions = body.instructions;

    await db
      .update(ordresTravail)
      .set(updateData)
      .where(eq(ordresTravail.id, otId));

    const [updated] = await db
      .select()
      .from(ordresTravail)
      .where(eq(ordresTravail.id, otId));

    return NextResponse.json({ success: true, ordreTravail: updated });
  } catch (error) {
    console.error("PATCH OT error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
