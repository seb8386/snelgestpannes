import { NextResponse } from "next/server";
import { db } from "@/db";
import { utilisateurs, abonnes, reclamations, ordresTravail, interventions, equipes, notifications } from "@/db/schema";
import bcrypt from "bcryptjs";
import { ensureRoleEnum } from "@/lib/ensure-schema";
import { getAuthUser } from "@/lib/auth";
import { count } from "drizzle-orm";

export async function POST() {
  try {
    await ensureRoleEnum();
    const existingCount = await db.select({ value: count() }).from(utilisateurs);
    const hasUsers = (existingCount[0]?.value ?? 0) > 0;
    if (hasUsers) {
      const authUser = await getAuthUser();
      if (!authUser || authUser.role !== "superadmin") {
        return NextResponse.json(
          { error: "Seul le super-utilisateur peut réinitialiser la base." },
          { status: 403 }
        );
      }
    }

    // Clear existing data
    await db.delete(notifications);
    await db.delete(interventions);
    await db.delete(ordresTravail);
    await db.delete(reclamations);
    await db.delete(abonnes);
    await db.delete(utilisateurs);
    await db.delete(equipes);

    const hash = (pw: string) => bcrypt.hash(pw, 12);

    const [superResult] = await db.insert(utilisateurs).values({
      nom: "Super Utilisateur SNEL",
      email: "superadmin@snel.cd",
      motDePasse: await hash("SuperAdmin123"),
      role: "superadmin",
      telephone: "+243 80 000 0001",
    });
    const superId = typeof superResult.insertId === "number" ? superResult.insertId : null;
    if (!superId) throw new Error("Impossible de créer le super-utilisateur");

    const [adminResult] = await db.insert(utilisateurs).values({
      nom: "Jean-Paul Mukendi",
      email: "admin@snel.cd",
      motDePasse: await hash("admin123"),
      role: "administrateur",
      telephone: "+243 81 234 5678",
    });
    const adminId = typeof adminResult.insertId === "number" ? adminResult.insertId : null;
    if (!adminId) throw new Error("Impossible de créer l'utilisateur administrateur");

    const [cdResult] = await db.insert(utilisateurs).values({
      nom: "Marie Kabila",
      email: "cd@snel.cd",
      motDePasse: await hash("cd1234"),
      role: "cd",
      telephone: "+243 82 345 6789",
    });
    const cdId = typeof cdResult.insertId === "number" ? cdResult.insertId : null;
    if (!cdId) throw new Error("Impossible de créer l'utilisateur CD");

    const [get1Result] = await db.insert(utilisateurs).values({
      nom: "Pierre Mwamba",
      email: "get1@snel.cd",
      motDePasse: await hash("get1234"),
      role: "get",
      telephone: "+243 83 456 7890",
    });
    const get1Id = typeof get1Result.insertId === "number" ? get1Result.insertId : null;
    if (!get1Id) throw new Error("Impossible de créer l'utilisateur GET 1");

    const [get2Result] = await db.insert(utilisateurs).values({
      nom: "Paul Tshala",
      email: "get2@snel.cd",
      motDePasse: await hash("get1234"),
      role: "get",
      telephone: "+243 84 567 8901",
    });
    const get2Id = typeof get2Result.insertId === "number" ? get2Result.insertId : null;
    if (!get2Id) throw new Error("Impossible de créer l'utilisateur GET 2");

    const [abonne1Result] = await db.insert(utilisateurs).values({
      nom: "Alphonse Ngoy",
      email: "abonne1@email.com",
      motDePasse: await hash("abonne123"),
      role: "abonne",
      telephone: "+243 85 678 9012",
    });
    const abonne1Id = typeof abonne1Result.insertId === "number" ? abonne1Result.insertId : null;
    if (!abonne1Id) throw new Error("Impossible de créer l'abonné 1");

    const [abonne2Result] = await db.insert(utilisateurs).values({
      nom: "Cécile Mutombo",
      email: "abonne2@email.com",
      motDePasse: await hash("abonne123"),
      role: "abonne",
      telephone: "+243 86 789 0123",
    });
    const abonne2Id = typeof abonne2Result.insertId === "number" ? abonne2Result.insertId : null;
    if (!abonne2Id) throw new Error("Impossible de créer l'abonné 2");

    const [abonne3Result] = await db.insert(utilisateurs).values({
      nom: "David Lumumba",
      email: "abonne3@email.com",
      motDePasse: await hash("abonne123"),
      role: "abonne",
      telephone: "+243 87 890 1234",
    });
    const abonne3Id = typeof abonne3Result.insertId === "number" ? abonne3Result.insertId : null;
    if (!abonne3Id) throw new Error("Impossible de créer l'abonné 3");

    // Create abonnés profiles
    await db.insert(abonnes).values([
      {
        utilisateurId: abonne1Id,
        numeroAbonne: "SNEL-2024-001",
        adresse: "12 Avenue du Peuple, Kitambo",
        commune: "Kitambo",
        quartier: "Malueka",
      },
      {
        utilisateurId: abonne2Id,
        numeroAbonne: "SNEL-2024-002",
        adresse: "45 Boulevard Lumumba, Kitambo",
        commune: "Kitambo",
        quartier: "Kintambo Magasin",
      },
      {
        utilisateurId: abonne3Id,
        numeroAbonne: "SNEL-2024-003",
        adresse: "78 Rue Victoire, Kinshasa",
        commune: "Kitambo",
        quartier: "Kintambo",
      },
    ]);

    // Create équipes GET
    const [equipe1Result] = await db.insert(equipes).values({
      nom: "Équipe Alpha GET",
      specialite: "Haute tension / Transformateurs",
      responsableId: get1Id,
      disponible: true,
    });
    const equipe1Id = typeof equipe1Result.insertId === "number" ? equipe1Result.insertId : null;
    if (!equipe1Id) throw new Error("Impossible de créer l'équipe 1");

    const [equipe2Result] = await db.insert(equipes).values({
      nom: "Équipe Beta GET",
      specialite: "Basse tension / Compteurs",
      responsableId: get2Id,
      disponible: true,
    });
    const equipe2Id = typeof equipe2Result.insertId === "number" ? equipe2Result.insertId : null;
    if (!equipe2Id) throw new Error("Impossible de créer l'équipe 2");

    // Create réclamations
    const [rec1Result] = await db.insert(reclamations).values({
      utilisateurId: abonne1Id,
      description: "Coupure totale de courant dans tout le quartier Malueka depuis ce matin 06h00. Plusieurs maisons affectées.",
      localisation: "Quartier Malueka, Avenue du Peuple, Kitambo",
      typePanne: "coupure_secteur",
      statut: "resolu",
      priorite: "elevee",
      scoreIa: 82,
      analyseIa: "Analyse IA: Panne de type coupure générale détectée. Score d'urgence: 82/100. Cette panne affecte potentiellement plusieurs abonnés.",
      categorieIa: "Coupure de secteur",
      dateReclamation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dateResolution: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });
    const rec1Id = typeof rec1Result.insertId === "number" ? rec1Result.insertId : null;
    if (!rec1Id) throw new Error("Impossible de créer la réclamation 1");

    const [rec2Result] = await db.insert(reclamations).values({
      utilisateurId: abonne2Id,
      description: "Court-circuit dans ma maison. Des étincelles sortent du tableau électrique. Très dangereux!",
      localisation: "45 Boulevard Lumumba, Kintambo Magasin",
      typePanne: "court_circuit",
      statut: "en_cours",
      priorite: "elevee",
      scoreIa: 95,
      analyseIa: "⚠️ ALERTE IA: Court-circuit ou incident électrique grave détecté! Score critique: 95/100. INTERVENTION D'URGENCE REQUISE.",
      categorieIa: "Court-circuit / Urgence électrique",
      dateReclamation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });
    const rec2Id = typeof rec2Result.insertId === "number" ? rec2Result.insertId : null;
    if (!rec2Id) throw new Error("Impossible de créer la réclamation 2");

    const [rec3Result] = await db.insert(reclamations).values({
      utilisateurId: abonne3Id,
      description: "Fluctuation de tension très importante. Mon réfrigérateur et téléviseur ont grillé à cause des chutes de tension répétées.",
      localisation: "78 Rue Victoire, Kintambo",
      typePanne: "surcharge",
      statut: "en_attente",
      priorite: "moyenne",
      scoreIa: 70,
      analyseIa: "Analyse IA: Surcharge ou fluctuation de tension détectée. Score: 70/100.",
      categorieIa: "Surcharge / Fluctuation de tension",
      dateReclamation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });
    const rec3Id = typeof rec3Result.insertId === "number" ? rec3Result.insertId : null;
    if (!rec3Id) throw new Error("Impossible de créer la réclamation 3");

    const [rec4Result] = await db.insert(reclamations).values({
      utilisateurId: abonne1Id,
      description: "Mon compteur électrique ne fonctionne plus. L'écran est éteint et je ne peux plus recharger mes unités.",
      localisation: "12 Avenue du Peuple, Kitambo",
      typePanne: "probleme_compteur",
      statut: "en_attente",
      priorite: "faible",
      scoreIa: 55,
      analyseIa: "Analyse IA: Problème lié au système de comptage identifié. Score: 55/100.",
      categorieIa: "Problème de compteur",
      dateReclamation: new Date(Date.now() - 3 * 60 * 60 * 1000),
    });
    const rec4Id = typeof rec4Result.insertId === "number" ? rec4Result.insertId : null;
    if (!rec4Id) throw new Error("Impossible de créer la réclamation 4");

    const [rec5Result] = await db.insert(reclamations).values({
      utilisateurId: abonne2Id,
      description: "Un câble électrique est tombé sur la route devant notre maison. Très dangereux pour les piétons surtout les enfants.",
      localisation: "Carrefour Kintambo, près du marché",
      typePanne: "probleme_cablage",
      statut: "en_cours",
      priorite: "elevee",
      scoreIa: 88,
      analyseIa: "Analyse IA: Problème d'infrastructure électrique détecté. Score: 88/100. Inspection des câbles nécessaire.",
      categorieIa: "Problème de câblage / Infrastructure",
      dateReclamation: new Date(Date.now() - 5 * 60 * 60 * 1000),
    });
    const rec5Id = typeof rec5Result.insertId === "number" ? rec5Result.insertId : null;
    if (!rec5Id) throw new Error("Impossible de créer la réclamation 5");

    // Create OTs
    const [ot1Result] = await db.insert(ordresTravail).values({
      reclamationId: rec1Id,
      creePar: cdId,
      statut: "clos",
      urgence: "urgent",
      instructions: "Vérifier le transformateur principal du quartier Malueka. Rétablir l'alimentation en urgence.",
      equipeId: equipe1Id,
      dateEcheance: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      dateCreation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
    const ot1Id = typeof ot1Result.insertId === "number" ? ot1Result.insertId : null;
    if (!ot1Id) throw new Error("Impossible de créer l'ordre de travail 1");

    const [ot2Result] = await db.insert(ordresTravail).values({
      reclamationId: rec2Id,
      creePar: cdId,
      statut: "affecte",
      urgence: "critique",
      instructions: "URGENT: Court-circuit signalé. Sécuriser la zone et couper l'alimentation. Porter les EPI complets.",
      equipeId: equipe1Id,
      dateEcheance: new Date(Date.now() + 2 * 60 * 60 * 1000),
      dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });
    const ot2Id = typeof ot2Result.insertId === "number" ? ot2Result.insertId : null;
    if (!ot2Id) throw new Error("Impossible de créer l'ordre de travail 2");

    const [ot3Result] = await db.insert(ordresTravail).values({
      reclamationId: rec5Id,
      creePar: adminId,
      statut: "affecte",
      urgence: "urgent",
      instructions: "Sécuriser le câble tombé. Interdire l'accès à la zone. Réparer dans les 4h.",
      equipeId: equipe2Id,
      dateCreation: new Date(Date.now() - 4 * 60 * 60 * 1000),
    });
    const ot3Id = typeof ot3Result.insertId === "number" ? ot3Result.insertId : null;
    if (!ot3Id) throw new Error("Impossible de créer l'ordre de travail 3");

    // Create interventions
    await db.insert(interventions).values({
      otId: ot1Id,
      technicienId: get1Id,
      rapport: "Transformateur TR-12 du quartier Malueka défaillant. Remplacement effectué avec succès.",
      resultat: "Alimentation électrique rétablie pour 156 abonnés du quartier.",
      statut: "terminee",
      materielsUtilises: "Transformateur 250KVA, câbles HT 35m, connecteurs",
      dateIntervention: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dateFin: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });

    await db.insert(interventions).values({
      otId: ot2Id,
      technicienId: get1Id,
      rapport: "Court-circuit au niveau du tableau électrique principal. Zone sécurisée.",
      statut: "en_cours",
      materielsUtilises: "EPI complet, disjoncteur différentiel, câbles BT",
      dateIntervention: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    await db.insert(interventions).values({
      otId: ot3Id,
      technicienId: get2Id,
      rapport: "Câble BT 240mm² tombé suite aux intempéries. Zone sécurisée avec signalisation.",
      statut: "en_cours",
      materielsUtilises: "Câble BT 50m, poteaux support, isolants",
      dateIntervention: new Date(Date.now() - 3 * 60 * 60 * 1000),
    });

    // Create notifications
    await db.insert(notifications).values([
      {
        utilisateurId: superId,
        titre: "Contrôle du système",
        message: "Vous êtes le super-utilisateur : vous pouvez utiliser tous les modules et gérer l'ensemble des comptes.",
        type: "success",
        lue: false,
      },
      {
        utilisateurId: adminId,
        titre: "Système initialisé",
        message: "Bienvenue dans le système de gestion des réclamations SNEL - CVS Kitambo.",
        type: "success",
        lue: true,
      },
      {
        utilisateurId: abonne1Id,
        titre: "✅ Panne résolue",
        message: "Votre réclamation #1 a été résolue. Alimentation électrique rétablie pour votre quartier.",
        type: "success",
        lue: false,
      },
      {
        utilisateurId: abonne2Id,
        titre: "Réclamation en cours",
        message: "Un ordre de travail a été généré pour votre réclamation. Un technicien sera dépêché.",
        type: "info",
        lue: false,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Base de données initialisée avec succès",
      comptes: [
        { role: "Super utilisateur", email: "superadmin@snel.cd", motDePasse: "SuperAdmin123" },
        { role: "Administrateur", email: "admin@snel.cd", motDePasse: "admin123" },
        { role: "CD (Chef de Division)", email: "cd@snel.cd", motDePasse: "cd1234" },
        { role: "GET (Technicien 1)", email: "get1@snel.cd", motDePasse: "get1234" },
        { role: "GET (Technicien 2)", email: "get2@snel.cd", motDePasse: "get1234" },
        { role: "Abonné 1", email: "abonne1@email.com", motDePasse: "abonne123" },
        { role: "Abonné 2", email: "abonne2@email.com", motDePasse: "abonne123" },
        { role: "Abonné 3", email: "abonne3@email.com", motDePasse: "abonne123" },
      ],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Erreur lors de l'initialisation" }, { status: 500 });
  }
}
