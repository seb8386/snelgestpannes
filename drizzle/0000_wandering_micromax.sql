CREATE TABLE `abonnes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`utilisateur_id` int NOT NULL,
	`numero_abonne` varchar(50) NOT NULL,
	`adresse` text NOT NULL,
	`commune` varchar(100),
	`quartier` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abonnes_id` PRIMARY KEY(`id`),
	CONSTRAINT `abonnes_numero_abonne_unique` UNIQUE(`numero_abonne`)
);
--> statement-breakpoint
CREATE TABLE `equipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nom` varchar(255) NOT NULL,
	`responsable_id` int,
	`specialite` varchar(255),
	`disponible` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `equipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interventions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ot_id` int NOT NULL,
	`technicien_id` int,
	`rapport` text,
	`resultat` text,
	`statut` enum('planifiee','en_cours','terminee','annulee') NOT NULL DEFAULT 'planifiee',
	`materiels_utilises` text,
	`date_intervention` timestamp NOT NULL DEFAULT (now()),
	`date_fin` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membres_equipe` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipe_id` int NOT NULL,
	`utilisateur_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `membres_equipe_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`utilisateur_id` int NOT NULL,
	`message` text NOT NULL,
	`titre` varchar(255) NOT NULL,
	`lue` boolean NOT NULL DEFAULT false,
	`type` varchar(50) NOT NULL DEFAULT 'info',
	`date_envoi` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordres_travail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reclamation_id` int NOT NULL,
	`cree_par` int NOT NULL,
	`date_creation` timestamp NOT NULL DEFAULT (now()),
	`statut` enum('valide','affecte','clos') NOT NULL DEFAULT 'valide',
	`urgence` enum('normal','urgent','critique') NOT NULL DEFAULT 'normal',
	`instructions` text,
	`equipe_id` int,
	`date_echeance` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ordres_travail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reclamations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`utilisateur_id` int NOT NULL,
	`description` text NOT NULL,
	`localisation` varchar(500) NOT NULL,
	`type_panne` enum('coupure_secteur','court_circuit','surcharge','probleme_compteur','probleme_cablage','autre') NOT NULL DEFAULT 'autre',
	`statut` enum('en_attente','en_cours','resolu','ferme') NOT NULL DEFAULT 'en_attente',
	`priorite` enum('faible','moyenne','elevee') NOT NULL DEFAULT 'moyenne',
	`score_ia` int,
	`analyse_ia` text,
	`categorie_ia` varchar(255),
	`date_reclamation` timestamp NOT NULL DEFAULT (now()),
	`date_resolution` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reclamations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `utilisateurs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nom` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`mot_de_passe` varchar(255) NOT NULL,
	`role` enum('superadmin','administrateur','cd','get','abonne') NOT NULL DEFAULT 'abonne',
	`telephone` varchar(20),
	`actif` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `utilisateurs_id` PRIMARY KEY(`id`),
	CONSTRAINT `utilisateurs_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `abonnes` ADD CONSTRAINT `abonnes_utilisateur_id_utilisateurs_id_fk` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `equipes` ADD CONSTRAINT `equipes_responsable_id_utilisateurs_id_fk` FOREIGN KEY (`responsable_id`) REFERENCES `utilisateurs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interventions` ADD CONSTRAINT `interventions_ot_id_ordres_travail_id_fk` FOREIGN KEY (`ot_id`) REFERENCES `ordres_travail`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interventions` ADD CONSTRAINT `interventions_technicien_id_utilisateurs_id_fk` FOREIGN KEY (`technicien_id`) REFERENCES `utilisateurs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membres_equipe` ADD CONSTRAINT `membres_equipe_equipe_id_equipes_id_fk` FOREIGN KEY (`equipe_id`) REFERENCES `equipes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membres_equipe` ADD CONSTRAINT `membres_equipe_utilisateur_id_utilisateurs_id_fk` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_utilisateur_id_utilisateurs_id_fk` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_reclamation_id_reclamations_id_fk` FOREIGN KEY (`reclamation_id`) REFERENCES `reclamations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_cree_par_utilisateurs_id_fk` FOREIGN KEY (`cree_par`) REFERENCES `utilisateurs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_equipe_id_equipes_id_fk` FOREIGN KEY (`equipe_id`) REFERENCES `equipes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reclamations` ADD CONSTRAINT `reclamations_utilisateur_id_utilisateurs_id_fk` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE no action ON UPDATE no action;