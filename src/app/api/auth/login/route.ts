import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken, Role } from "@/lib/auth";
import { ensureRoleEnum } from "@/lib/ensure-schema";
import { ROLE_DASHBOARD_PATH } from "@/lib/navigation";
import { isRole } from "@/lib/roles";

export async function POST(request: NextRequest) {
  try {
    await ensureRoleEnum();
    const { email, motDePasse } = await request.json();

    if (!email || !motDePasse) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(utilisateurs)
      .where(eq(utilisateurs.email, email));

    if (!user || !(await bcrypt.compare(motDePasse, user.motDePasse))) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }

    if (!user.actif) {
      return NextResponse.json({ error: "Compte désactivé." }, { status: 401 });
    }

    const role: Role = isRole(user.role) ? user.role : "abonne";
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role,
      nom: user.nom,
    });
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role,
        redirectTo: ROLE_DASHBOARD_PATH[role],
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}