import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
// Load environment variables early, in case this service is run independently
dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeQuestionPrompt = async (question: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please analyze this student question: "${question}"`,
            config: {
                systemInstruction: "You are a helpful teaching assistant AI. Your job is to analyze student questions, categorize them, and provide a brief dummy answer or complexity score. Output JSON with 'complexity' (number 1-10), 'category' (string), and 'suggestedAnswer' (string).",
                responseMimeType: "application/json",
            }
        });
        
        return response.text ? JSON.parse(response.text) : null;
    } catch (error) {
        console.error("Error analyzing question via Gemini:", error);
        // Provide a dummy fallback if it fails
        return {
            complexity: 2,
            category: "Dummy Factual",
            suggestedAnswer: "This is a fallback dummy response due to an AI processing error.",
            error: true
        };
    }
};
