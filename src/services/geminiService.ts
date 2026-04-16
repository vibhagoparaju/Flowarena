import { GoogleGenAI } from "@google/genai";
import { AIInsight, ZoneData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getAIInsights(zones: ZoneData[]): Promise<AIInsight[]> {
  try {
    const prompt = `You are the FlowArena Stadium Intelligence AI. 
    Analyze the following stadium zone data and provide 2-3 strategic operational insights.
    
    Data:
    ${zones.map(z => `${z.id}: ${z.density}% density, ${z.occupancy}/${z.capacity} fans. Predicted: ${z.predictedDensity}%`).join('\n')}
    
    Return insights in a JSON array format with fields: title, content, action (optional), severity (info, warning, critical).
    Keep it professional, data-driven, and focused on crowd safety and revenue optimization.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return [{
      title: "System Analysis Offline",
      content: "Real-time AI analysis is currently unavailable. Reverting to rule-based safety protocols.",
      severity: "warning"
    }];
  }
}
