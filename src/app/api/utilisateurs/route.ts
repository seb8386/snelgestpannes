import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { utilisateurs, abonnes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canAssignRole, canManageUsers, isRole } from "@/lib/roles";
import { ensureRoleEnum } from "@/lib/ensure-schema";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !canManageUsers(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const users = await db
      .select({
        id: utilisateurs.id,
        nom: utilisateurs.nom,
        email: utilisateurs.email,
        role: utilisateurs.role,
        telephone: utilisateurs.telephone,
        actif: utilisateurs.actif,
        createdAt: utilisateurs.createdAt,
      })
      .from(utilisateurs)
      .orderBy(utilisateurs.createdAt);

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET utilisateurs error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureRoleEnum();
    const authUser = await getAuthUser();
    if (!authUser || !canManageUsers(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { nom, email, motDePasse, role, telephone } = body;

    if (!nom || !email || !motDePasse || !role) {
      return NextResponse.json({ error: "Tous les champs requis" }, { status: 400 });
    }

    if (!isRole(role) || !canAssignRole(authUser.role, role)) {
      return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    const existing = await db
      .select()
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email));

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 12);

    // Utilisation de .returning({ id: utilisateurs.id }) pour PostgreSQL
    const [insertedUser] = await db
      .insert(utilisateurs)
      .values({
        nom,
        email,
        motDePasse: hashedPassword,
        role,
        telephone: telephone || null,
      })
      .returning({ id: utilisateurs.id });

    const newUserId = insertedUser?.id;
    if (!newUserId) {
      return NextResponse.json({ error: "Impossible de créer l'utilisateur" }, { status: 500 });
    }

    if (role === "abonne") {
      const numeroAbonne = `SNEL-${Date.now()}-${newUserId}`;
      await db.insert(abonnes).values({
        utilisateurId: newUserId,
        numeroAbonne,
        adresse: "À compléter",
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: newUserId, nom, email, role },
    });
  } catch (error) {
    console.error("POST utilisateur error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}