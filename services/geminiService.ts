
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ARCHETYPES } from '@/constants';
import type { UserPreferences } from '@/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || ""});

const archetypeNames = ARCHETYPES.map(a => a.name).join(", ");
const archetypeDescriptions = ARCHETYPES.map(a => `- ${a.name}: ${a.description}`).join("\n");

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        archetypeName: {
            type: Type.STRING,
            description: `The name of the most fitting archetype. Must be one of: ${archetypeNames}`,
        },
        summary: {
            type: Type.STRING,
            description: `A 2-3 sentence, personalized, and engaging summary for the user explaining why they fit this archetype, written in a warm and insightful tone. Address the user directly as "You".`,
        },
    },
    required: ["archetypeName", "summary"],
};

const formatPreferencesForPrompt = (prefs: UserPreferences) => {
    return Object.entries(prefs)
        .map(([key, value]) => {
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            const formattedValue = (Array.isArray(value) && value.length > 0) ? value.join(', ') : 'Not specified';
            return `- ${capitalizedKey}: ${formattedValue}`;
        })
        .join('\n');
};


export async function generateArchetype(preferences: UserPreferences): Promise<{ archetypeName: string, summary: string }> {
  const prompt = `
    Based on the following user preferences, determine their "Taste Personality Archetype".

    User Preferences:
    ${formatPreferencesForPrompt(preferences)}

    Here are the available archetypes:
    ${archetypeDescriptions}

    Analyze the user's tastes and choose the single best-fitting archetype from the list. Then, generate a personalized summary explaining the choice.
    Return the result as a JSON object matching the provided schema.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Validate that the returned archetype name is one of the allowed names
    if (ARCHETYPES.some(a => a.name === result.archetypeName)) {
        return result;
    } else {
        console.error("Gemini returned an invalid archetype name:", result.archetypeName);
        // Fallback or re-throw error
        throw new Error("Received an invalid archetype from the API.");
    }

  } catch (error) {
    console.error("Error generating archetype with Gemini:", error);
    // Provide a generic fallback in case of API error
    return {
        archetypeName: "Indie Explorer",
        summary: "There was an issue connecting to the AI, but you seem like someone with a unique and discerning taste. You likely enjoy discovering hidden gems and forging your own path, much like an Indie Explorer."
    };
  }
}
