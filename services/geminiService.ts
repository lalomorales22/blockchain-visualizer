import { GoogleGenAI } from "@google/genai";
import { PlanetData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBlockchainInsights = async (planet: PlanetData, currentPrice: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a brief, futuristic, 2-sentence "Planetary Report" for the planet representing the ${planet.name} blockchain. 
      Mention current market sentiment based on a simulated price of $${currentPrice}. 
      Assume the persona of an intergalactic trade navigator. 
      Do not include markdown formatting.`
    });
    return response.text || "Communications interference. Data unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to establish subspace link with Gemini mainframe.";
  }
};

export const askGeminiAboutCrypto = async (question: string, contextPlanet: PlanetData): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: The user is viewing a 3D visualization of the ${contextPlanet.name} blockchain represented as a planet.
      
      User Question: ${question}
      
      Answer briefly (under 50 words) and creatively, using space/planetary metaphors where appropriate, but keeping facts accurate regarding the blockchain technology.`
    });
    return response.text || "I couldn't process that signal.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Subspace transmission failed.";
  }
};
