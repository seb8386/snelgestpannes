import axios from 'axios';

// Interface définissant la structure de la réponse de l'IA
export interface AnalyseIA {
  typePanne: string;
  priorite: "faible" | "moyenne" | "elevee";
  scoreUrgence: number;
  categorie: string;
  analyse: string;
  suggestions: string[];
}

/**
 * Analyse une réclamation technique SNEL via OpenRouter.
 * Utilise Axios pour une gestion robuste des requêtes réseau.
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

    // Appel à l'API via Axios avec un timeout de 30 secondes
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model:"google/gemini-3.5-flash",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://snel-kintambo.cd", // URL de ton projet
          "X-Title": "Gestion Pannes SNEL",
          "Content-Type": "application/json"
        },
        timeout: 30000, // Timeout de 30 secondes pour compenser la latence réseau
      }
    );

    const text = response.data.choices[0].message.content;
    
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