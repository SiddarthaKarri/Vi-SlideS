import OpenAI from 'openai';
import dotenv from 'dotenv';
// Load environment variables early, in case this service is run independently
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeQuestionPrompt = async (question: string) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: "You are a helpful teaching assistant AI. Your job is to analyze student questions, categorize them, and provide a brief dummy answer or complexity score. Output JSON with 'complexity' (number 1-10), 'category' (string), and 'suggestedAnswer' (string)." 
                },
                { 
                    role: "user", 
                    content: `Please analyze this student question: "${question}"` 
                }
            ],
            response_format: { type: "json_object" }
        });
        
        const result = response.choices[0].message.content;
        return result ? JSON.parse(result) : null;
    } catch (error) {
        console.error("Error analyzing question via OpenAI:", error);
        // Provide a dummy fallback if it fails
        return {
            complexity: 2,
            category: "Dummy Factual",
            suggestedAnswer: "This is a fallback dummy response due to an AI processing error.",
            error: true
        };
    }
};
