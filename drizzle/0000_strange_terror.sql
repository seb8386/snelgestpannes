CREATE TYPE "public"."priorite" AS ENUM('faible', 'moyenne', 'elevee');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'administrateur', 'cd', 'get', 'abonne');--> statement-breakpoint
CREATE TYPE "public"."statut_intervention" AS ENUM('planifiee', 'en_cours', 'terminee', 'annulee');--> statement-breakpoint
CREATE TYPE "public"."statut_ot" AS ENUM('valide', 'affecte', 'clos');--> statement-breakpoint
CREATE TYPE "public"."statut_reclamation" AS ENUM('en_attente', 'en_cours', 'resolu', 'ferme');--> statement-breakpoint
CREATE TYPE "public"."type_panne" AS ENUM('coupure_secteur', 'court_circuit', 'surcharge', 'probleme_compteur', 'probleme_cablage', 'autre');--> statement-breakpoint
CREATE TYPE "public"."urgence_ot" AS ENUM('normal', 'urgent', 'critique');--> statement-breakpoint
CREATE TABLE "abonnes" (
	"id" serial PRIMARY KEY NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"numero_abonne" varchar(50) NOT NULL,
	"adresse" text NOT NULL,
	"commune" varchar(100),
	"quartier" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "abonnes_numero_abonne_unique" UNIQUE("numero_abonne")
);
--> statement-breakpoint
CREATE TABLE "equipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"responsable_id" integer,
	"specialite" varchar(255),
	"disponible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interventions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ot_id" integer NOT NULL,
	"technicien_id" integer,
	"rapport" text,
	"resultat" text,
	"statut" "statut_intervention" DEFAULT 'planifiee' NOT NULL,
	"materiels_utilises" text,
	"date_intervention" timestamp DEFAULT now() NOT NULL,
	"date_fin" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membres_equipe" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipe_id" integer NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"message" text NOT NULL,
	"titre" varchar(255) NOT NULL,
	"lue" boolean DEFAULT false NOT NULL,
	"type" varchar(50) DEFAULT 'info' NOT NULL,
	"date_envoi" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordres_travail" (
	"id" serial PRIMARY KEY NOT NULL,
	"reclamation_id" integer NOT NULL,
	"cree_par" integer NOT NULL,
	"date_creation" timestamp DEFAULT now() NOT NULL,
	"statut" "statut_ot" DEFAULT 'valide' NOT NULL,
	"urgence" "urgence_ot" DEFAULT 'normal' NOT NULL,
	"instructions" text,
	"equipe_id" integer,
	"date_echeance" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reclamations" (
	"id" serial PRIMARY KEY NOT NULL,
	"utilisateur_id" integer NOT NULL,
	"description" text NOT NULL,
	"localisation" varchar(500) NOT NULL,
	"type_panne" "type_panne" DEFAULT 'autre' NOT NULL,
	"statut" "statut_reclamation" DEFAULT 'en_attente' NOT NULL,
	"priorite" "priorite" DEFAULT 'moyenne' NOT NULL,
	"score_ia" integer,
	"analyse_ia" text,
	"categorie_ia" varchar(255),
	"date_reclamation" timestamp DEFAULT now() NOT NULL,
	"date_resolution" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilisateurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"mot_de_passe" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'abonne' NOT NULL,
	"telephone" varchar(20),
	"actif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "utilisateurs_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "abonnes" ADD CONSTRAINT "abonnes_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipes" ADD CONSTRAINT "equipes_responsable_id_utilisateurs_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_ot_id_ordres_travail_id_fk" FOREIGN KEY ("ot_id") REFERENCES "public"."ordres_travail"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_technicien_id_utilisateurs_id_fk" FOREIGN KEY ("technicien_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membres_equipe" ADD CONSTRAINT "membres_equipe_equipe_id_equipes_id_fk" FOREIGN KEY ("equipe_id") REFERENCES "public"."equipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membres_equipe" ADD CONSTRAINT "membres_equipe_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordres_travail" ADD CONSTRAINT "ordres_travail_reclamation_id_reclamations_id_fk" FOREIGN KEY ("reclamation_id") REFERENCES "public"."reclamations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordres_travail" ADD CONSTRAINT "ordres_travail_cree_par_utilisateurs_id_fk" FOREIGN KEY ("cree_par") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordres_travail" ADD CONSTRAINT "ordres_travail_equipe_id_equipes_id_fk" FOREIGN KEY ("equipe_id") REFERENCES "public"."equipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reclamations" ADD CONSTRAINT "reclamations_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE no action ON UPDATE no action;