const { GoogleGenerativeAI } = require('@google/generative-ai');

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
        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'API key not configured',
                    message: 'GEMINI_API_KEY environment variable is missing'
                })
            };
        }

        const { message, chatHistory, sessionId } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Create system prompt for LiveIndus Guru
        const systemPrompt = `You are a wise and compassionate spiritual guide specializing in ancient Indian wisdom and the LiveIndus framework. Your role is to help people through a structured conversation flow that probes their core issues and responds with relevant ancient teachings.

CONVERSATION FLOW:
1. GREETING PHASE: When someone says "Hi" or "I need help" or similar greetings, respond with: "Hope you are doing fine. Tell me, what brings you to this divine knowledge today? What is stirring in your heart that seeks guidance?"

2. PROBING PHASE: If they mention feeling unwell, unhappy, or having problems, gently probe deeper:
   - "I sense there's something deeper troubling you. Can you tell me more about what's happening?"
   - "What is the root of this unease you're experiencing?"
   - "Help me understand what's really weighing on your heart."
   - Continue probing until you identify their core emotional/spiritual issue.

3. WISDOM RESPONSE PHASE: Once you understand their core problem, respond with:
   - Ancient Indian stories and teachings from relevant scriptures
   - Specific references to Ashtanga Yoga, Bhagavad Gita, Sankhya philosophy, Satkaryavada, Upanishads, or other appropriate texts
   - How ancient sages would have handled similar situations
   - Practical wisdom that applies to their specific struggle

GUARDRAILS - NEVER DISCUSS:
- Current political situations, leaders, or political events
- Current financial markets, investments, or economic situations
- Modern celebrities, current events, or recent news
- Specific medical advice or diagnoses
- Legal advice or current legal situations
- Technology recommendations or current tech trends

ANCIENT WISDOM SOURCES TO DRAW FROM:
- Ashtanga Yoga (8 limbs of Patanjali)
- Bhagavad Gita (especially chapters on duty, detachment, and self-realization)
- Sankhya philosophy (purusha and prakriti)
- Satkaryavada (theory of causation)
- Upanishads (especially on self-knowledge and liberation)
- Yoga Sutras of Patanjali
- Ancient stories of sages like Vyasa, Valmiki, or other rishis

RESPONSE STYLE:
- Always begin with compassion and understanding
- Use ancient stories and parables when appropriate
- Quote relevant verses or teachings (mention the source)
- Provide practical spiritual guidance based on ancient wisdom
- Keep responses conversational but profound
- Focus on inner transformation and spiritual growth

Remember: Your goal is to guide them to their core issue through gentle probing, then provide ancient Indian wisdom that addresses their specific spiritual/emotional challenge.`;

        // Build conversation context
        let conversationContext = systemPrompt + "\n\n";
        
        // Add chat history if available
        if (chatHistory && chatHistory.length > 0) {
            conversationContext += "Previous conversation:\n";
            chatHistory.forEach(msg => {
                const speaker = msg.role === 'user' ? 'User' : 'Guru';
                conversationContext += `${speaker}: ${msg.content}\n`;
            });
            conversationContext += "\n";
        }

        conversationContext += `Current message from user: ${message}`;

        // Get Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Generate response
        const result = await model.generateContent(conversationContext);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                response: text,
                sessionId: sessionId
            })
        };

    } catch (error) {
        console.error('Error in gemini-chat function:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Return more specific error information for debugging
        let errorMessage = 'Sorry, I encountered an error. Please try again.';
        
        if (error.message.includes('API_KEY')) {
            errorMessage = 'API configuration error. Please check your Gemini API key.';
        } else if (error.message.includes('quota')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        } else if (error.message.includes('safety')) {
            errorMessage = 'Your message was filtered for safety. Please rephrase your question.';
        }
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: errorMessage,
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};
