import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (id) {
      await db
        .update(notifications)
        .set({ lue: true })
        .where(
          and(
            eq(notifications.id, id),
            eq(notifications.utilisateurId, authUser.userId)
          )
        );
    } else {
      // Mark all as read
      await db
        .update(notifications)
        .set({ lue: true })
        .where(eq(notifications.utilisateurId, authUser.userId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST notifications lire error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
