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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { message } = JSON.parse(event.body);
        
        console.log('=== DEBUG START ===');
        console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
        console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
        console.log('Message received:', message);
        
        if (!process.env.GEMINI_API_KEY) {
            console.log('ERROR: No API key found');
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: "ERROR: No API key found. Please set GEMINI_API_KEY environment variable.",
                    sessionId: 'debug_session'
                })
            };
        }

        try {
            console.log('Attempting to load GoogleGenerativeAI...');
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            console.log('GoogleGenerativeAI loaded successfully');
            
            console.log('Initializing genAI...');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            console.log('genAI initialized');
            
            console.log('Getting model...');
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            console.log('Model obtained');
            
            const prompt = `You are a wise and compassionate spiritual guide. Keep responses short, natural, and profound. Never mention specific texts or sources.

When someone says "Hi" or greetings, respond: "Hope you are doing fine. Tell me, what brings you to this divine knowledge today? What is stirring in your heart that seeks guidance?"

For other messages, provide gentle wisdom and guidance. Ask probing questions to understand their deeper issues. Be compassionate and wise, like a caring teacher. Keep responses under 3 sentences.

Never discuss politics, finance, current events, or mention specific scriptures.

User: ${message}`;

            console.log('Sending request to Gemini...');
            const result = await model.generateContent(prompt);
            console.log('Received response from Gemini');
            const response = await result.response;
            const aiResponse = response.text();
            console.log('AI Response:', aiResponse.substring(0, 100) + '...');

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: aiResponse,
                    sessionId: 'debug_session'
                })
            };

        } catch (geminiError) {
            console.log('GEMINI ERROR:', geminiError.message);
            console.log('GEMINI ERROR STACK:', geminiError.stack);
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: `GEMINI ERROR: ${geminiError.message}`,
                    sessionId: 'debug_session'
                })
            };
        }

    } catch (error) {
        console.log('MAIN ERROR:', error.message);
        console.log('MAIN ERROR STACK:', error.stack);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: `MAIN ERROR: ${error.message}`,
                sessionId: 'debug_session'
            })
        };
    }
};
