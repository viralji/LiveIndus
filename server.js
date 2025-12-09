const path = require('path');
const express = require('express');

// Reuse the existing Netlify function implementation for chat
const { handler: chatHandler } = require('./netlify/functions/gemini-chat-smart');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Serve static assets from the project root
app.use(express.static(path.join(__dirname)));

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    const event = {
        httpMethod: 'POST',
        body: JSON.stringify(req.body || {})
    };

    try {
        const result = await chatHandler(event, {});
        const statusCode = result.statusCode || 200;
        const headers = result.headers || {};

        // Apply headers from the function response
        Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));

        // The Netlify function returns a JSON string body
        return res.status(statusCode).send(result.body);
    } catch (err) {
        console.error('Chat API error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// SPA fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`LiveIndus server running on port ${PORT}`);
});

