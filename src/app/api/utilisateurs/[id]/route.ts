import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canAssignRole, canManageUsers, canMutateUser, isRole } from "@/lib/roles";
import { ensureRoleEnum } from "@/lib/ensure-schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureRoleEnum();
    const authUser = await getAuthUser();
    if (!authUser || !canManageUsers(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    const [target] = await db.select().from(utilisateurs).where(eq(utilisateurs.id, userId));
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (!canMutateUser(authUser, { role: target.role, id: target.id })) {
      return NextResponse.json({ error: "Impossible de modifier un super-utilisateur" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.nom) updateData.nom = body.nom;
    if (body.telephone !== undefined) updateData.telephone = body.telephone;
    if (body.actif !== undefined) {
      if (userId === authUser.userId) {
        return NextResponse.json({ error: "Impossible de désactiver votre propre compte" }, { status: 400 });
      }
      updateData.actif = body.actif;
    }
    if (body.role) {
      if (!isRole(body.role) || !canAssignRole(authUser.role, body.role)) {
        return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });
      }
      if (userId === authUser.userId && authUser.role === "superadmin" && body.role !== "superadmin") {
        const supers = await db.select({ id: utilisateurs.id }).from(utilisateurs).where(eq(utilisateurs.role, "superadmin"));
        if (supers.length <= 1) {
          return NextResponse.json({ error: "Le dernier super-utilisateur ne peut pas changer de rôle" }, { status: 400 });
        }
      }
      updateData.role = body.role;
    }

    await db
      .update(utilisateurs)
      .set(updateData)
      .where(eq(utilisateurs.id, userId));

    const [updated] = await db
      .select()
      .from(utilisateurs)
      .where(eq(utilisateurs.id, userId));

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("PATCH utilisateur error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !canManageUsers(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (userId === authUser.userId) {
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
    }

    const [target] = await db.select().from(utilisateurs).where(eq(utilisateurs.id, userId));
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (!canMutateUser(authUser, { role: target.role, id: target.id })) {
      return NextResponse.json({ error: "Impossible de supprimer un super-utilisateur" }, { status: 403 });
    }

    if (target.role === "superadmin") {
      const supers = await db.select({ id: utilisateurs.id }).from(utilisateurs).where(eq(utilisateurs.role, "superadmin"));
      if (supers.length <= 1) {
        return NextResponse.json({ error: "Impossible de supprimer le dernier super-utilisateur" }, { status: 400 });
      }
    }

    await db.delete(utilisateurs).where(eq(utilisateurs.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE utilisateur error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
