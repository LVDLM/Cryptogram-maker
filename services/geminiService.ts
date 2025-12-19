import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePracticeText = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Genera una frase o un párrafo corto (máximo 25 palabras) en español sobre el tema: "${topic}". 
      El texto está dirigido a niños con dislexia, así que usa vocabulario sencillo, estructura directa (sujeto + verbo + predicado) y evita palabras excesivamente complejas. 
      Devuelve SOLO el texto plano, sin comillas ni formato markdown.`,
    });

    return response.text?.trim() || "Error generando texto.";
  } catch (error) {
    console.error("Error generating text:", error);
    return "El sol brilla en el cielo azul."; // Fallback
  }
};
