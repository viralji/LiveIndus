// Simple test script to test the Gemini function locally
// Run with: node test-function.js

const fetch = require('node-fetch');

async function testGeminiFunction() {
    const testData = {
        message: "Hi",
        chatHistory: [],
        sessionId: "test_session_123"
    };

    try {
        console.log('Testing Gemini function...');
        console.log('Test data:', testData);

        const response = await fetch('http://localhost:8888/.netlify/functions/gemini-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('Response data:', data);

        if (data.response) {
            console.log('✅ Success! AI Response:', data.response);
        } else {
            console.log('❌ Error:', data.error || 'Unknown error');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Check if running locally
if (process.env.NODE_ENV !== 'test') {
    testGeminiFunction();
}

module.exports = { testGeminiFunction };
