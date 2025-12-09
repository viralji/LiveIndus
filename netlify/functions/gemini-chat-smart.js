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
            const isFirstMessage = conversationHistory.length === 0;
            const fallbackMessage = isFirstMessage 
                ? "Hi there. I'm here to help guide you through whatever you're facing. What's on your mind today? (Note: Please set your GEMINI_API_KEY in Netlify environment variables to enable AI responses.)"
                : "I'm here to listen and help. Please continue sharing what's on your mind. (Note: Please set your GEMINI_API_KEY in Netlify environment variables to enable AI responses.)";
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: fallbackMessage,
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

            // Count user messages to determine conversation phase
            const userMessages = conversationHistory.filter(msg => msg.role === 'user').length;
            const isFirstMessage = conversationHistory.length === 0;
            const shouldSynthesize = userMessages >= 3 && userMessages <= 4; // After 3-4 user messages
            
            // Check if assistant's last message was a synthesis
            const lastAssistantMsg = conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'assistant' 
                ? conversationHistory[conversationHistory.length - 1].content.toLowerCase()
                : '';
            const hasSynthesized = lastAssistantMsg && (
                lastAssistantMsg.includes('sounds like') || 
                lastAssistantMsg.includes('it seems') ||
                lastAssistantMsg.includes('what you\'re going through') ||
                lastAssistantMsg.includes('does that sound right') ||
                lastAssistantMsg.includes('am i understanding')
            );

            // Check if guidance has been offered (look for practice suggestions)
            const guidanceOffered = conversationHistory.some(msg => 
                msg.role === 'assistant' && (
                    msg.content.toLowerCase().includes('breath') ||
                    msg.content.toLowerCase().includes('practice') ||
                    msg.content.toLowerCase().includes('technique') ||
                    msg.content.toLowerCase().includes('try') ||
                    msg.content.toLowerCase().includes('might help')
                )
            );

            // Check for frustration signals
            const currentUserMsg = message.toLowerCase();
            const isFrustrated = currentUserMsg.includes('useless') ||
                                currentUserMsg.includes('not helping') ||
                                currentUserMsg.includes('doesn\'t help') ||
                                currentUserMsg.includes('not working') ||
                                currentUserMsg.includes('waste');

            // Check for explicit help request
            const askingForHelp = currentUserMsg.includes('can you help') ||
                                 currentUserMsg.includes('help me') ||
                                 currentUserMsg.includes('need help') ||
                                 currentUserMsg.includes('what to do');

            // Check if one-on-one was already offered
            const oneOnOneOffered = conversationHistory.some(msg =>
                msg.role === 'assistant' && (
                    msg.content.toLowerCase().includes('one-on-one') ||
                    msg.content.toLowerCase().includes('speak with a guru') ||
                    msg.content.toLowerCase().includes('call')
                )
            );

            // Determine if we should offer one-on-one
            const shouldOfferOneOnOne = !oneOnOneOffered && (
                (guidanceOffered && userMessages >= 6) || // After guidance and 6+ messages
                (isFrustrated && guidanceOffered) || // User frustrated after guidance
                (askingForHelp && userMessages >= 5) || // Explicit help request after some conversation
                (userMessages >= 8) // Long conversation, clearly needs more support
            );

            // Determine conversation phase
            let conversationPhase = '';
            if (isFirstMessage) {
                conversationPhase = 'FIRST_MESSAGE: Give a warm, welcoming greeting that invites them to share what\'s on their mind. Keep it simple and natural.';
            } else if (shouldOfferOneOnOne) {
                conversationPhase = 'OFFER_ONE_ON_ONE: The user needs deeper support. Offer a one-on-one call with a guru naturally. Acknowledge their struggle briefly, then offer: "Would it help to speak one-on-one with a guru who can provide more personalized guidance for what you\'re going through?" Keep it natural and caring, not salesy.';
            } else if (shouldSynthesize && !hasSynthesized) {
                conversationPhase = `SYNTHESIS_PHASE: You've had ${userMessages} exchanges. Now synthesize what you understand about their situation and emotional state. Present it back to them in a natural way, like: "It sounds like you're [feeling/experiencing X] because [situation Y]. You're worried about [concern Z]. Does that sound right?" Keep it concise (2-3 sentences) and wait for their confirmation before offering guidance.`;
            } else if (hasSynthesized) {
                // Assistant just synthesized, now check if user is confirming
                const isConfirming = currentUserMsg.includes('yes') || 
                                    currentUserMsg.includes('right') || 
                                    currentUserMsg.includes('correct') || 
                                    currentUserMsg.includes('that\'s it') ||
                                    currentUserMsg.includes('exactly') ||
                                    currentUserMsg.length < 15; // Short responses often indicate confirmation
                
                if (isConfirming) {
                    conversationPhase = 'GUIDANCE_PHASE: User has confirmed your understanding. Now offer practical help - suggest relevant ancient practices, techniques, or perspectives that relate to their situation. For example, if they\'re stressed/anxious about their teenager, mention calming practices, breathwork, or ways to stay patient. If it\'s about worry for the future, mention practices for managing anxiety. Keep it practical and natural - 2-4 sentences. Don\'t use jargon.';
                } else {
                    conversationPhase = 'CONTINUE_UNDERSTANDING: User is clarifying or adding more context after your synthesis. Continue to understand their situation naturally.';
                }
            } else if (userMessages < 3) {
                conversationPhase = 'UNDERSTANDING_PHASE: Ask natural follow-up questions to understand their situation. Keep questions simple and direct. Match their communication style. One question at a time.';
            } else {
                conversationPhase = 'CONTINUE_CONVERSATION: Continue the conversation naturally. Be empathetic and supportive.';
            }

            // Create dynamic system prompt that adapts to conversation
            const systemPrompt = `You are a wise, compassionate guide who helps people through life's challenges using ancient wisdom in a natural, accessible way. You speak like a wise friend - using everyday language, not flowery spiritual jargon.

CONVERSATION STYLE:
- Use natural, conversational language. Match the user's communication style - if they're direct, be direct.
- Keep responses concise (2-3 sentences for questions, 3-4 sentences for guidance).
- Be warm and genuine, not robotic or over-engineered.
- Show empathy when appropriate, but don't overdo it.

ANCIENT PRACTICES YOU CAN REFERENCE (when offering guidance):
- Breathing techniques for calming the mind
- Practices for patience and understanding (especially in relationships)
- Techniques for managing worry and anxiety
- Ways to find clarity and perspective
- Methods for staying present and grounded
- Practices from the eight-fold path (but don't name it - just describe the practice naturally)

IMPORTANT RULES:
- Never mention specific scriptures, texts, or sources by name
- Never discuss politics, finance, or current events
- Don't give medical advice, but you can offer emotional support and perspective
- Avoid flowery language - speak naturally
- When offering one-on-one calls, make it feel natural and caring, not like a sales pitch

${conversationPhase}

${conversationContext}Current user message: ${message}

Respond naturally:`;

            const prompt = systemPrompt;

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
            console.error('Gemini Error:', geminiError);
            // Fallback if Gemini fails
            const isFirstMessage = conversationHistory.length === 0;
            const fallbackMessage = isFirstMessage
                ? "Hi there. I'm here to help guide you through whatever you're facing. What's on your mind today? (Note: AI service temporarily unavailable, but I'm here to listen.)"
                : "I'm here to listen and help. Please continue sharing what's on your mind. (Note: AI service temporarily unavailable, but I'm here to listen.)";
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    response: fallbackMessage,
                    sessionId: 'fallback_session'
                })
            };
        }

    } catch (error) {
        console.error('Handler Error:', error);
        // Try to determine if this is first message, but default to generic message if we can't parse
        let fallbackMessage = "Hi there. I'm here to help guide you through whatever you're facing. What's on your mind today?";
        try {
            const body = JSON.parse(event.body);
            const conversationHistory = body.conversationHistory || [];
            if (conversationHistory.length > 0) {
                fallbackMessage = "I'm here to listen and help. Please continue sharing what's on your mind.";
            }
        } catch {
            // Use default message if we can't parse
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                response: fallbackMessage,
                sessionId: 'error_session'
            })
        };
    }
};
