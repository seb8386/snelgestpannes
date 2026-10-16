import axios from 'axios';

const OPENROUTER_MODEL = "google/gemini-2.5-flash";

// Interface définissant la structure de la réponse de l'IA
export interface AnalyseIA {
  typePanne: string;
  priorite: "faible" | "moyenne" | "elevee";
  scoreUrgence: number;
  categorie: string;
  analyse: string;
  suggestions: string[];
}

/** Appelle OpenRouter avec un prompt texte et renvoie la réponse brute du modèle. */
async function callOpenRouter(prompt: string): Promise<string> {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://snel-kintambo.cd",
        "X-Title": "Gestion Pannes SNEL",
        "Content-Type": "application/json",
      },
      timeout: 30000, // Timeout de 30 secondes pour compenser la latence réseau
    }
  );

  return response.data.choices[0].message.content as string;
}

/**
 * Analyse une réclamation technique SNEL via OpenRouter.
 */
export async function analyserReclamation(description: string): Promise<AnalyseIA> {
  try {
    const prompt = `
      Tu es un expert technique de la SNEL à Kinshasa.
      Analyse cette réclamation client : "${description}".

      Instructions strictes :
      - Priorise les urgences vitales (incendies, court-circuits, fumée).
      - Réponds UNIQUEMENT avec un objet JSON strict, sans texte introductif ni Markdown.
      - Tes conseils doivent être adaptés au réseau électrique local.

      Retourne un objet JSON avec ces champs exacts :
      {
        "typePanne": "coupure_secteur" | "court_circuit" | "surcharge" | "probleme_compteur" | "probleme_cablage" | "autre",
        "priorite": "faible" | "moyenne" | "elevee",
        "scoreUrgence": number,
        "categorie": string,
        "analyse": string,
        "suggestions": ["conseil 1", "conseil 2", "conseil 3"]
      }
    `;

    const text = await callOpenRouter(prompt);

    // Nettoyage robuste pour ne garder que le JSON pur
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(jsonString);

  } catch (error: any) {
    // Journalisation détaillée de l'erreur pour débogage
    console.error("Erreur lors de l'analyse IA :", error.message || error);

    // Fallback de sécurité : renvoie une structure valide pour ne pas casser l'UI
    return {
      typePanne: "autre",
      priorite: "faible",
      scoreUrgence: 0,
      categorie: "Erreur de connexion",
      analyse: "Le service d'analyse est temporairement indisponible en raison d'une instabilité réseau. Veuillez réessayer.",
      suggestions: ["Vérifiez votre connexion internet", "Réessayez dans quelques instants", "Contactez l'agence SNEL si le problème persiste"]
    };
  }
}

const ROLE_CONTEXT: Record<string, string> = {
  superadmin: "le super-utilisateur, responsable du pilotage global du système et de l'administration complète",
  administrateur: "un administrateur, responsable de la supervision opérationnelle du réseau électrique",
  cd: "un Chef de Dépannage (CD), responsable de la validation des réclamations et de l'affectation des équipes GET",
  get: "un technicien GET sur le terrain, responsable de l'exécution des interventions",
  abonne: "un abonné SNEL qui suit l'avancement de ses réclamations",
};

/**
 * Génère une synthèse IA personnalisée pour le tableau de bord d'un rôle,
 * à partir des statistiques réelles du système (remplace les messages statiques).
 */
export async function genererSyntheseRole(role: string, stats: Record<string, unknown>): Promise<string> {
  const contexte = ROLE_CONTEXT[role] || ROLE_CONTEXT.abonne;

  try {
    const prompt = `
      Tu es l'Agent IA du système de gestion des pannes électriques SNEL CVS Kitambo à Kinshasa.
      Tu t'adresses à ${contexte}.

      Voici les statistiques actuelles du système au format JSON :
      ${JSON.stringify(stats)}

      Rédige une synthèse courte (3 phrases maximum, pas de Markdown, pas de listes) qui :
      - Interprète ces chiffres pour ce rôle précis.
      - Signale un risque ou une priorité si les chiffres le justifient.
      - Donne une recommandation concrète et actionnable.
      Réponds uniquement avec le texte de la synthèse, en français.
    `;

    const text = await callOpenRouter(prompt);
    return text.trim();
  } catch (error: any) {
    console.error("Erreur lors de la synthèse IA par rôle :", error.message || error);
    return "L'Agent IA est temporairement indisponible. Les statistiques restent consultables manuellement ci-dessous.";
  }
}

export interface RecommandationIA {
  titre: string;
  detail: string;
  priorite: "faible" | "moyenne" | "elevee";
  reclamationId: number | null;
}

export interface SyntheseOperationnelle {
  synthese: string;
  recommandations: RecommandationIA[];
}

const FALLBACK_OPERATIONNEL: SyntheseOperationnelle = {
  synthese: "L'Agent IA est temporairement indisponible. Consultez les réclamations et ordres de travail ci-dessous pour décider manuellement.",
  recommandations: [],
};

/**
 * Génère des recommandations opérationnelles concrètes (priorisation, affectation d'équipes,
 * anomalies réseau) à partir de l'état réel du système : réclamations en attente, OT actifs,
 * équipes disponibles et répartition géographique des pannes.
 */
export async function genererRecommandations(contexte: Record<string, unknown>): Promise<SyntheseOperationnelle> {
  try {
    const prompt = `
      Tu es l'Agent IA décisionnel du système de gestion des pannes électriques SNEL CVS Kitambo à Kinshasa.
      Tu aides les responsables (Chef de Dépannage, Administrateur) à décider quoi faire MAINTENANT.

      Voici l'état réel actuel du système, au format JSON :
      ${JSON.stringify(contexte)}

      Analyse ces données et identifie :
      - Les réclamations à traiter en priorité (urgence vitale, ancienneté, zone à risque).
      - Les affectations d'équipes les plus pertinentes selon leur spécialité et leur disponibilité.
      - Les anomalies réseau (ex : plusieurs pannes répétées dans le même quartier = possible panne d'infrastructure).

      Réponds UNIQUEMENT avec un objet JSON strict, sans texte introductif ni Markdown, au format exact :
      {
        "synthese": "2-3 phrases résumant la situation globale et le risque principal",
        "recommandations": [
          {
            "titre": "action courte et concrète",
            "detail": "pourquoi cette action, en une phrase",
            "priorite": "faible" | "moyenne" | "elevee",
            "reclamationId": number ou null si l'action ne concerne pas une réclamation précise
          }
        ]
      }
      Maximum 5 recommandations, triées de la plus urgente à la moins urgente.
    `;

    const text = await callOpenRouter(prompt);
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonString);

    return {
      synthese: typeof parsed.synthese === "string" ? parsed.synthese : FALLBACK_OPERATIONNEL.synthese,
      recommandations: Array.isArray(parsed.recommandations) ? parsed.recommandations : [],
    };
  } catch (error: any) {
    console.error("Erreur lors de la génération des recommandations IA :", error.message || error);
    return FALLBACK_OPERATIONNEL;
  }
}