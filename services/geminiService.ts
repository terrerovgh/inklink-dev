
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to guide Gemini to act as a tattoo curator for the Albuquerque market
const CURATOR_SYSTEM_INSTRUCTION = `
You are InkLink's AI curator, specifically tuned for the Albuquerque, New Mexico tattoo market. 
Your goal is to understand user tattoo ideas and translate them into search filters or creative concepts.

Context:
- Albuquerque has a strong "Fine Line", "Black & Grey", "Neo-Traditional", and "Anime/Pop Culture" scene.
- Users may reference local themes (Zia symbol, Sandia Mountains, desert flora, Breaking Bad, Route 66).

When a user describes a tattoo, analyze it for:
1. Subject matter (e.g., lion, rose, geometric shape)
2. Style (e.g., realism, traditional, minimalist, watercolor)
3. Body placement (e.g., arm, leg, back)

Always be concise and helpful.
`;

// NEW: System Prompt for the Tattoo Project Studio
const ARTIST_SYSTEM_INSTRUCTION = `
Act as a veteran tattoo artist with 20 years of experience.
Your goal is to interpret client ideas into technical "Line Art" or "Stencil" descriptions.
You value clean lines, high contrast, and anatomical flow.
You strictly avoid photorealism in descriptions; focus on how the ink should look on skin.
`;

export const analyzeRequest = async (userQuery: string): Promise<{
  conversationResponse: string;
  filters?: { style?: string; bodyPart?: string; keywords: string[] };
}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: CURATOR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conversationResponse: { type: Type.STRING, description: "A friendly, short response to the user interpreting their request." },
            filters: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING, description: "The artistic style inferred (e.g., 'minimalist', 'traditional')." },
                bodyPart: { type: Type.STRING, description: "The body placement inferred." },
                keywords: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "3-5 keywords describing the subject matter."
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      conversationResponse: "I'm connecting to the local ABQ network. Showing all results.",
      filters: { keywords: [] }
    };
  }
};

export const generateConceptDescription = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a vivid, artistic description of a tattoo design based on this request: "${prompt}". Keep it under 50 words. Focus on visual elements.`,
        });
        return response.text || "Could not generate concept.";
    } catch (e) {
        console.error("Gemini Error:", e);
        return "Error generating concept.";
    }
}

// Updated for Tattoo Studio Flow: Stencil Generation
export const generateTattooDesign = async (prompt: string, bodyZone?: string): Promise<string | null> => {
  try {
    // Enhanced Prompt for Stencil/Line Art result
    const refinedPrompt = `
      Create a professional tattoo stencil design.
      Subject: ${prompt}
      Placement Context: To be placed on the ${bodyZone || 'body'}.
      Style: High contrast black and white line art. Clean outlines. No shading, no grey wash. 
      Background: Pure white (to be made transparent later).
      Aesthetic: Minimalist, crisp, ready for thermal transfer.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: refinedPrompt }]
      },
      config: {
        // Ensuring strictly 1 image
      }
    });
    
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};

export const generateProjectReport = async (prompt: string, bodyZone: string): Promise<{
    estimatedHours: number;
    priceMin: number;
    priceMax: number;
    technicalNotes: string;
}> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this tattoo project for the Albuquerque market.
            Request: "${prompt}"
            Zone: "${bodyZone}"
            
            Output JSON with:
            - estimatedHours (number)
            - priceMin (number, assuming $150/hr base)
            - priceMax (number)
            - technicalNotes (string, advice for the artist regarding this placement and design)`,
            config: {
                systemInstruction: ARTIST_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estimatedHours: { type: Type.NUMBER },
                        priceMin: { type: Type.NUMBER },
                        priceMax: { type: Type.NUMBER },
                        technicalNotes: { type: Type.STRING }
                    }
                }
            }
        });
        const text = response.text;
        return text ? JSON.parse(text) : { estimatedHours: 3, priceMin: 450, priceMax: 600, technicalNotes: "Consult artist." };
    } catch (error) {
        return { estimatedHours: 3, priceMin: 450, priceMax: 600, technicalNotes: "Error generating estimates." };
    }
};

export const generateArtistBio = async (artistName: string, styles: string[], location: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a creative, professional, and unique tattoo artist biography for ${artistName} based in ${location}. 
      They specialize in: ${styles.join(', ')}. 
      Keep it under 60 words. Tone: Artistic, modern, and inviting.`,
    });
    return response.text || "Biography temporarily unavailable.";
  } catch (error) {
    console.error("Gemini Bio Generation Error:", error);
    return "Biography temporarily unavailable.";
  }
};

// --- CHAT AI FEATURES ---

export const generateSmartReplies = async (history: string, role: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: A chat between a Tattoo Client and an Artist.
      Conversation History:
      ${history}
      
      Task: Generate 3 short, natural, and professional quick replies for the ${role} to send next.
      Output: JSON Array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return ["Okay", "Sounds good", "Can you send details?"];
    return JSON.parse(text);
  } catch (error) {
    return ["Okay", "Sounds good", "Let me check"];
  }
};

export const refineMessageText = async (draft: string, role: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following chat message to be more professional, polite, and clear.
      Sender Role: ${role} (Tattoo industry context).
      Draft: "${draft}"
      
      Output: The rewritten string only.`,
    });
    return response.text?.trim() || draft;
  } catch (error) {
    return draft;
  }
};
