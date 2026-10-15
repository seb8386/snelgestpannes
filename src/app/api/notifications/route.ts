import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.utilisateurId, authUser.userId))
      .orderBy(desc(notifications.dateEnvoi))
      .limit(50);

    return NextResponse.json(notifs);
  } catch (error) {
    console.error("GET notifications error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
