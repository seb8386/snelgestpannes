import { pgTable, serial, text, varchar, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Définition des enums PostgreSQL
export const roleEnum = pgEnum('role', ["superadmin", "administrateur", "cd", "get", "abonne"]);
export const typePanneEnum = pgEnum('type_panne', ['coupure_secteur', 'court_circuit', 'surcharge', 'probleme_compteur', 'probleme_cablage', 'autre']);
export const statutReclamationEnum = pgEnum('statut_reclamation', ['en_attente', 'en_cours', 'resolu', 'ferme']);
export const prioriteEnum = pgEnum('priorite', ['faible', 'moyenne', 'elevee']);
export const statutOtEnum = pgEnum('statut_ot', ['valide', 'affecte', 'clos']);
export const urgenceOtEnum = pgEnum('urgence_ot', ['normal', 'urgent', 'critique']);
export const statutInterventionEnum = pgEnum('statut_intervention', ['planifiee', 'en_cours', 'terminee', 'annulee']);

// Table utilisateurs
export const utilisateurs = pgTable("utilisateurs", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("abonne"),
  telephone: varchar("telephone", { length: 20 }),
  actif: boolean("actif").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table abonnes
export const abonnes = pgTable("abonnes", {
  id: serial("id").primaryKey(),
  utilisateurId: integer("utilisateur_id").notNull().references(() => utilisateurs.id),
  numeroAbonne: varchar("numero_abonne", { length: 50 }).notNull().unique(),
  adresse: text("adresse").notNull(),
  commune: varchar("commune", { length: 100 }),
  quartier: varchar("quartier", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table réclamations
export const reclamations = pgTable("reclamations", {
  id: serial("id").primaryKey(),
  utilisateurId: integer("utilisateur_id").notNull().references(() => utilisateurs.id),
  description: text("description").notNull(),
  localisation: varchar("localisation", { length: 500 }).notNull(),
  typePanne: typePanneEnum("type_panne").default('autre').notNull(),
  statut: statutReclamationEnum("statut").default('en_attente').notNull(),
  priorite: prioriteEnum("priorite").default('moyenne').notNull(),
  scoreIa: integer("score_ia"),
  analyseIa: text("analyse_ia"),
  categorieIa: varchar("categorie_ia", { length: 255 }),
  dateReclamation: timestamp("date_reclamation").defaultNow().notNull(),
  dateResolution: timestamp("date_resolution"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table équipes
export const equipes = pgTable("equipes", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  responsableId: integer("responsable_id").references(() => utilisateurs.id),
  specialite: varchar("specialite", { length: 255 }),
  disponible: boolean("disponible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table ordres de travail
export const ordresTravail = pgTable("ordres_travail", {
  id: serial("id").primaryKey(),
  reclamationId: integer("reclamation_id").notNull().references(() => reclamations.id),
  creePar: integer("cree_par").notNull().references(() => utilisateurs.id),
  dateCreation: timestamp("date_creation").defaultNow().notNull(),
  statut: statutOtEnum("statut").default('valide').notNull(),
  urgence: urgenceOtEnum("urgence").default('normal').notNull(),
  instructions: text("instructions"),
  equipeId: integer("equipe_id").references(() => equipes.id),
  dateEcheance: timestamp("date_echeance"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table membres équipe
export const membresEquipe = pgTable("membres_equipe", {
  id: serial("id").primaryKey(),
  equipeId: integer("equipe_id").notNull().references(() => equipes.id),
  utilisateurId: integer("utilisateur_id").notNull().references(() => utilisateurs.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table interventions
export const interventions = pgTable("interventions", {
  id: serial("id").primaryKey(),
  otId: integer("ot_id").notNull().references(() => ordresTravail.id),
  technicienId: integer("technicien_id").references(() => utilisateurs.id),
  rapport: text("rapport"),
  resultat: text("resultat"),
  statut: statutInterventionEnum("statut").default('planifiee').notNull(),
  materielsUtilises: text("materiels_utilises"),
  dateIntervention: timestamp("date_intervention").defaultNow().notNull(),
  dateFin: timestamp("date_fin"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  utilisateurId: integer("utilisateur_id").notNull().references(() => utilisateurs.id),
  message: text("message").notNull(),
  titre: varchar("titre", { length: 255 }).notNull(),
  lue: boolean("lue").notNull().default(false),
  type: varchar("type", { length: 50 }).default('info').notNull(),
  dateEnvoi: timestamp("date_envoi").defaultNow().notNull(),
});