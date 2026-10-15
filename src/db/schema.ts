import { mysqlTable, int, varchar, text, boolean, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";

// Table utilisateurs
export const utilisateurs = mysqlTable("utilisateurs", {
  id: int("id").autoincrement().primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["superadmin", "administrateur", "cd", "get", "abonne"]).notNull().default("abonne"),
  telephone: varchar("telephone", { length: 20 }),
  actif: boolean("actif").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Table abonnes
export const abonnes = mysqlTable("abonnes", {
  id: int("id").autoincrement().primaryKey(),
  utilisateurId: int("utilisateur_id").notNull().references(() => utilisateurs.id),
  numeroAbonne: varchar("numero_abonne", { length: 50 }).notNull().unique(),
  adresse: text("adresse").notNull(),
  commune: varchar("commune", { length: 100 }),
  quartier: varchar("quartier", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table réclamations
export const reclamations = mysqlTable("reclamations", {
  id: int("id").autoincrement().primaryKey(),
  utilisateurId: int("utilisateur_id").notNull().references(() => utilisateurs.id),
  description: text("description").notNull(),
  localisation: varchar("localisation", { length: 500 }).notNull(),
  typePanne: mysqlEnum("type_panne", ['coupure_secteur', 'court_circuit', 'surcharge', 'probleme_compteur', 'probleme_cablage', 'autre']).default('autre').notNull(),
  statut: mysqlEnum("statut", ['en_attente', 'en_cours', 'resolu', 'ferme']).default('en_attente').notNull(),
  priorite: mysqlEnum("priorite", ['faible', 'moyenne', 'elevee']).default('moyenne').notNull(),
  scoreIa: int("score_ia"),
  analyseIa: text("analyse_ia"),
  categorieIa: varchar("categorie_ia", { length: 255 }),
  dateReclamation: timestamp("date_reclamation").defaultNow().notNull(),
  dateResolution: timestamp("date_resolution"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Table équipes
export const equipes = mysqlTable("equipes", {
  id: int("id").autoincrement().primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  responsableId: int("responsable_id").references(() => utilisateurs.id),
  specialite: varchar("specialite", { length: 255 }),
  disponible: boolean("disponible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table ordres de travail
export const ordresTravail = mysqlTable("ordres_travail", {
  id: int("id").autoincrement().primaryKey(),
  reclamationId: int("reclamation_id").notNull().references(() => reclamations.id),
  creePar: int("cree_par").notNull().references(() => utilisateurs.id),
  dateCreation: timestamp("date_creation").defaultNow().notNull(),
  statut: mysqlEnum("statut", ['valide', 'affecte', 'clos']).default('valide').notNull(),
  urgence: mysqlEnum("urgence", ['normal', 'urgent', 'critique']).default('normal').notNull(),
  instructions: text("instructions"),
  equipeId: int("equipe_id").references(() => equipes.id),
  dateEcheance: timestamp("date_echeance"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Table membres équipe
export const membresEquipe = mysqlTable("membres_equipe", {
  id: int("id").autoincrement().primaryKey(),
  equipeId: int("equipe_id").notNull().references(() => equipes.id),
  utilisateurId: int("utilisateur_id").notNull().references(() => utilisateurs.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table interventions
export const interventions = mysqlTable("interventions", {
  id: int("id").autoincrement().primaryKey(),
  otId: int("ot_id").notNull().references(() => ordresTravail.id),
  technicienId: int("technicien_id").references(() => utilisateurs.id),
  rapport: text("rapport"),
  resultat: text("resultat"),
  statut: mysqlEnum("statut", ['planifiee', 'en_cours', 'terminee', 'annulee']).default('planifiee').notNull(),
  materielsUtilises: text("materiels_utilises"),
  dateIntervention: timestamp("date_intervention").defaultNow().notNull(),
  dateFin: timestamp("date_fin"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Table notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  utilisateurId: int("utilisateur_id").notNull().references(() => utilisateurs.id),
  message: text("message").notNull(),
  titre: varchar("titre", { length: 255 }).notNull(),
  lue: boolean("lue").notNull().default(false),
  type: varchar("type", { length: 50 }).default('info').notNull(),
  dateEnvoi: timestamp("date_envoi").defaultNow().notNull(),
});