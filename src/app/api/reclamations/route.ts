import { NextResponse } from "next/server";
import { db } from "@/db";
import { reclamations, ordresTravail, utilisateurs, notifications } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { desc, eq, inArray } from "drizzle-orm";
import { analyserReclamation } from "@/lib/ia";

// 1. GET : Gère l'affichage des réclamations
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const query = db.select().from(reclamations);

    // Filtrage par rôle pour la sécurité
    if (authUser.role === "abonne") {
      query.where(eq(reclamations.utilisateurId, authUser.userId));
    }

    const data = await query.orderBy(desc(reclamations.dateReclamation));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API GET:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération" }, { status: 500 });
  }
}

// 2. POST : Gère la création, l'analyse IA et l'automatisation OT
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.description || !body.localisation) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    // A. Analyse par votre module IA
    const iaResult = await analyserReclamation(body.description);

    // B. Insertion en base de données avec .returning() pour PostgreSQL
    const [nouvelleReclamation] = await db.insert(reclamations).values({
      utilisateurId: authUser.userId as number,
      description: body.description,
      localisation: body.localisation,
      typePanne: iaResult.typePanne as any,
      priorite: iaResult.priorite as any,
      analyseIa: iaResult.analyse,
      scoreIa: iaResult.scoreUrgence,
      statut: 'en_attente' as any,
    }).returning(); // Récupère directement la ligne insérée

    if (!nouvelleReclamation || !nouvelleReclamation.id) {
      return NextResponse.json({ error: "Impossible de récupérer l'ID de la réclamation" }, { status: 500 });
    }

    const newRecId = nouvelleReclamation.id;

    // C. Envoi de notifications aux responsables SNEL
    const responsables = await db
      .select({ id: utilisateurs.id, role: utilisateurs.role })
      .from(utilisateurs)
      .where(inArray(utilisateurs.role, ["superadmin", "administrateur", "cd"]));

    for (const responsable of responsables) {
      await db.insert(notifications).values({
        utilisateurId: responsable.id,
        titre: "Nouvelle réclamation",
        message: `Nouvelle réclamation #${newRecId} détectée : ${iaResult.categorie}. Priorité ${iaResult.priorite.toUpperCase()}.`,
        type: "info",
      });
    }

    // D. Automatisation : génération d'un OT si priorité élevée
    let autoOTId: number | null = null;
    if (iaResult.priorite === 'elevee') {
      const [nouvelOt] = await db.insert(ordresTravail).values({
        reclamationId: newRecId,
        urgence: 'urgent' as any,
        statut: 'valide' as any,
        creePar: authUser.userId as number,
      }).returning(); // Utilisation de .returning() ici aussi

      autoOTId = nouvelOt ? nouvelOt.id : null;

      const getMembers = await db
        .select({ userId: utilisateurs.id })
        .from(utilisateurs)
        .where(eq(utilisateurs.role, "get"));

      for (const member of getMembers) {
        await db.insert(notifications).values({
          utilisateurId: member.userId,
          titre: "Nouvel ordre de travail",
          message: `Ordre de travail #${autoOTId} créé automatiquement pour la réclamation #${newRecId}.`,
          type: "urgent",
        });
      }
    }

    // E. Confirmation de la réclamation au client
    await db.insert(notifications).values({
      utilisateurId: authUser.userId as number,
      titre: "Réclamation enregistrée",
      message: `Votre réclamation #${newRecId} a bien été prise en compte. Analyse IA: ${iaResult.categorie}.`,
      type: "success",
    });

    return NextResponse.json({ 
      success: true, 
      id: newRecId, 
      ia: iaResult,
      ordreTravailId: autoOTId,
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur API POST:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}