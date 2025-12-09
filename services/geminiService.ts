import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to guide Gemini to act as a tattoo curator
const SYSTEM_INSTRUCTION = `
You are InkLink's AI curator. Your goal is to understand user tattoo ideas and translate them into search filters or creative concepts.
When a user describes a tattoo, analyze it for:
1. Subject matter (e.g., lion, rose, geometric shape)
2. Style (e.g., realism, traditional, minimalist, watercolor)
3. Body placement (e.g., arm, leg, back)

Always be concise and helpful.
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
        systemInstruction: SYSTEM_INSTRUCTION,
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
      conversationResponse: "I'm having trouble connecting to the creative network. Showing all results.",
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

export const generateTattooDesign = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high quality tattoo design sketch of: ${prompt}. White background, clean lines, professional tattoo flash style. High contrast, artistic.` }]
      }
    });
    
    // Iterate through parts to find the image data
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

export const generateArtistBio = async (artistName: string, styles: string[], location: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a creative, professional, and unique tattoo artist biography for ${artistName} based in ${location}. 
      They specialize in: ${styles.join(', ')}. 
      Keep it under 60 words. Tone: Artistic, modern, and inviting. Do not use hashtags.`,
    });
    return response.text || "Biography temporarily unavailable.";
  } catch (error) {
    console.error("Gemini Bio Generation Error:", error);
    return "Biography temporarily unavailable.";
  }
};