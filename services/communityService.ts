import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || ""});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    welcomeMessage: {
      type: Type.STRING,
      description: "A personalized welcome message for the user joining the community",
    },
    recommendations: {
      type: Type.ARRAY,
      description: "List of 3 personalized recommendations for the user",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Title of the recommendation"
          },
          description: {
            type: Type.STRING,
            description: "Brief description of why this is recommended"
          }
        }
      }
    }
  },
  required: ["welcomeMessage", "recommendations"],
};

export async function generateCommunityRecommendations(archetypeName: string): Promise<{
  welcomeMessage: string;
  recommendations: Array<{ title: string; description: string }>;
}> {
  const prompt = `
    Generate a personalized community welcome message and recommendations for a user with the taste archetype: "${archetypeName}".
    
    The welcome message should be warm, engaging, and reference their archetype.
    
    The recommendations should be 3 specific items (movies, music, books, experiences, etc.) that would appeal to someone with this archetype.
    Each recommendation should have a title and a brief description explaining why it fits their taste profile.
    
    Return the result as a JSON object matching the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating community recommendations:", error);
    return {
      welcomeMessage: `Welcome to the ${archetypeName} community! Connect with others who share your unique taste profile.`,
      recommendations: [
        {
          title: "Explore our curated playlists",
          description: "Music selected specifically for your taste archetype."
        },
        {
          title: "Join our weekly discussions",
          description: "Share your thoughts on the latest trends and discoveries."
        },
        {
          title: "Check out our recommendations",
          description: "Personalized suggestions based on your taste profile."
        }
      ]
    };
  }
}