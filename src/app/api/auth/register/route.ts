import { NextResponse } from "next/server";
import { db } from "@/db";
import { utilisateurs, abonnes } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { ensureRoleEnum } from "@/lib/ensure-schema";

export async function POST(request: Request) {
  try {
    await ensureRoleEnum();
    const body = await request.json();
    const { nom, email, motDePasse } = body;

    if (!nom || !email || !motDePasse) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
    }

    if (typeof motDePasse !== "string" || motDePasse.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const existingUser = await db
      .select()
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // .returning({ id: utilisateurs.id }) permet de récupérer l'ID généré en PostgreSQL
    const [insertedUser] = await db
      .insert(utilisateurs)
      .values({
        nom,
        email,
        motDePasse: hashedPassword,
        role: "abonne",
      })
      .returning({ id: utilisateurs.id });

    const newUserId = insertedUser?.id;

    if (newUserId) {
      await db.insert(abonnes).values({
        utilisateurId: newUserId,
        numeroAbonne: `SNEL-${Date.now()}-${newUserId}`,
        adresse: "À compléter",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Compte abonné créé avec succès",
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'inscription." }, { status: 500 });
  }
}