
import { GoogleGenAI } from "@google/genai";

// Use Gemini API to get creator inspiration. 
// A new instance is created before making the call as per guidelines.
export const getCreatorInspiration = async (habitSummary: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位针对顶尖创作者的高级教练。根据本周进度：${habitSummary}，请提供一段简短（最多2句话）、有力且极具启发性的“创作者洞见”。要求：语气要像一位精英表现教练，充满鼓舞性，必须使用中文回复。`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // .text is a property, not a method.
    return response.text || "持续构建。在这个充满干扰的世界里，自律是唯一的套利机会。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "行动本身就是奖励。专注于下一个微小的动作。";
  }
};
