import { NextResponse } from "next/server";
import { db } from "@/db";
import { reclamations, interventions, ordresTravail, utilisateurs, abonnes } from "@/db/schema";
import { count, desc, eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const [recCount, intCount, otCount, recResolues, pannesParQuartier, pannesParCommune] = await Promise.all([
      db.select({ value: count() }).from(reclamations),
      db.select({ value: count() }).from(interventions),
      db.select({ value: count() }).from(ordresTravail),
      db.select({ value: count() }).from(reclamations).where(inArray(reclamations.statut, ["resolu", "ferme"])),
      db
        .select({ quartier: abonnes.quartier, total: count() })
        .from(reclamations)
        .leftJoin(utilisateurs, eq(reclamations.utilisateurId, utilisateurs.id))
        .leftJoin(abonnes, eq(utilisateurs.id, abonnes.utilisateurId))
        .groupBy(abonnes.quartier)
        .orderBy(desc(count()))
        .limit(10),
      db
        .select({ commune: abonnes.commune, total: count() })
        .from(reclamations)
        .leftJoin(utilisateurs, eq(reclamations.utilisateurId, utilisateurs.id))
        .leftJoin(abonnes, eq(utilisateurs.id, abonnes.utilisateurId))
        .groupBy(abonnes.commune)
        .orderBy(desc(count()))
        .limit(10),
    ]);

    const totalRec = recCount[0].value;
    const tauxResolution = totalRec > 0 ? Math.round((recResolues[0].value / totalRec) * 100) : 0;

    return NextResponse.json({
      reclamations: { total: totalRec },
      interventions: { total: intCount[0].value },
      ordresTravail: { total: otCount[0].value },
      tauxResolution,
      pannesParQuartier: pannesParQuartier.map((item) => ({
        quartier: item.quartier ?? "Inconnu",
        total: item.total,
      })),
      pannesParCommune: pannesParCommune.map((item) => ({
        commune: item.commune ?? "Inconnu",
        total: item.total,
      })),
    });
  } catch (error) {
    console.error("Erreur API Stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}