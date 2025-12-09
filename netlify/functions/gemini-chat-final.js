exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message, conversationHistory = [] } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Check API key
        if (!process.env.GEMINI_API_KEY) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: "Hope you are doing fine. Tell me, what brings you to this divine knowledge today? What is stirring in your heart that seeks guidance? (Note: Please set your GEMINI_API_KEY in Netlify environment variables to enable AI responses.)",
                    sessionId: 'fallback_session'
                })
            };
        }

        // Try Gemini API
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            // Build conversation context
            let conversationContext = "";
            if (conversationHistory.length > 0) {
                conversationContext = "Previous conversation:\n";
                conversationHistory.forEach(msg => {
                    conversationContext += `${msg.role}: ${msg.content}\n`;
                });
                conversationContext += "\n";
            }

            const prompt = `You are a wise spiritual guide. Follow this conversation flow based on the conversation length:

CONVERSATION FLOW:
1. FIRST MESSAGE: "Hope you are doing fine. Tell me, what brings you to this divine knowledge today? What is stirring in your heart that seeks guidance?"

2. PROBING PHASE (2-3 exchanges): Ask gentle questions to understand their core issue. Count exchanges and after 2-3, move to wisdom phase.

3. WISDOM PHASE: Provide ancient wisdom, practical guidance, and gentle advice for their situation.

4. RESOLUTION PHASE: After providing wisdom, ask: "Would you like to speak one-on-one with a guru over a call for deeper guidance?"

RULES:
- Keep responses under 3 sentences
- Never mention specific scriptures, texts, or sources
- Never discuss politics, finance, or current events
- Be compassionate and wise
- Count conversation exchanges and transition appropriately
- Always end with offering one-on-one guru call

${conversationContext}Current user message: ${message}

Respond as the wise guide:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const aiResponse = response.text();

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: aiResponse,
                    sessionId: 'gemini_session'
                })
            };

        } catch (geminiError) {
            // Fallback if Gemini fails
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: "Hope you are doing fine. Tell me, what brings you to this divine knowledge today? What is stirring in your heart that seeks guidance? (Note: AI service temporarily unavailable, but I'm here to listen.)",
                    sessionId: 'fallback_session'
                })
            };
        }

    } catch (error) {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: "Hope you are doing fine. Tell me, what brings you to this divine knowledge today? What is stirring in your heart that seeks guidance?",
                sessionId: 'error_session'
            })
        };
    }
};
