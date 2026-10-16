import { NextResponse } from "next/server";
import { db } from "@/db";
import { reclamations, ordresTravail, equipes, abonnes, utilisateurs } from "@/db/schema";
import { eq, inArray, desc, count } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { canUseIAModule } from "@/lib/roles";
import { genererRecommandations } from "@/lib/ia";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !canUseIAModule(authUser.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const [recActives, otActifs, equipesDispo, pannesParQuartier] = await Promise.all([
      db
        .select({
          id: reclamations.id,
          description: reclamations.description,
          localisation: reclamations.localisation,
          typePanne: reclamations.typePanne,
          statut: reclamations.statut,
          priorite: reclamations.priorite,
          dateReclamation: reclamations.dateReclamation,
        })
        .from(reclamations)
        .where(inArray(reclamations.statut, ["en_attente", "en_cours"]))
        .orderBy(desc(reclamations.priorite), reclamations.dateReclamation)
        .limit(20),
      db
        .select({
          id: ordresTravail.id,
          statut: ordresTravail.statut,
          urgence: ordresTravail.urgence,
          dateEcheance: ordresTravail.dateEcheance,
          nomEquipe: equipes.nom,
          localisationRec: reclamations.localisation,
        })
        .from(ordresTravail)
        .leftJoin(equipes, eq(ordresTravail.equipeId, equipes.id))
        .leftJoin(reclamations, eq(ordresTravail.reclamationId, reclamations.id))
        .where(inArray(ordresTravail.statut, ["valide", "affecte"]))
        .limit(20),
      db
        .select({
          id: equipes.id,
          nom: equipes.nom,
          specialite: equipes.specialite,
          disponible: equipes.disponible,
        })
        .from(equipes),
      db
        .select({ quartier: abonnes.quartier, total: count() })
        .from(reclamations)
        .leftJoin(utilisateurs, eq(reclamations.utilisateurId, utilisateurs.id))
        .leftJoin(abonnes, eq(utilisateurs.id, abonnes.utilisateurId))
        .groupBy(abonnes.quartier)
        .orderBy(desc(count()))
        .limit(10),
    ]);

    const contexte = {
      reclamationsEnAttenteOuEnCours: recActives,
      ordresDeTravailActifs: otActifs,
      equipes: equipesDispo,
      pannesParQuartier: pannesParQuartier.map((p) => ({ quartier: p.quartier ?? "Inconnu", total: p.total })),
    };

    const resultat = await genererRecommandations(contexte);
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("Erreur API recommandations IA:", error);
    return NextResponse.json({ error: "Échec de la génération des recommandations" }, { status: 500 });
  }
}
