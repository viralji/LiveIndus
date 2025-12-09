# LiveIndus - The Illuminated Artifact

A spiritual guidance website featuring the LiveIndus framework with an integrated AI chat assistant powered by Google Gemini.

## Features

- **Interactive Framework Guide**: Explore the LiveIndus philosophy through five main sections
- **Guruchat**: AI-powered spiritual guidance using Google Gemini
- **Session Memory**: Chat history maintained throughout the session
- **Responsive Design**: Beautiful chakra-inspired color scheme
- **Accessibility**: ARIA roles, keyboard navigation, and screen reader support

## LiveIndus Framework

The website presents a comprehensive spiritual framework including:

- **The Premise**: Understanding the divided life and path to coherence
- **The Method**: Core architecture with Axis, Arena, and Resonators
- **The Disciplines**: Four practices for integrated living
- **The Tides**: Three energy states for navigation
- **The Journey**: Transformation through the 30-Day Immersion

## Guruchat Integration

The chat feature provides:
- Real-time AI responses using Google Gemini
- Contextual understanding of LiveIndus concepts
- Session-based conversation memory
- Typing indicators and smooth animations

## Setup for Netlify Deployment

### 1. Environment Variables

In your Netlify dashboard, add these environment variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your Netlify environment variables

### 3. Deploy to Netlify

#### Option A: Git Integration
1. Push this repository to GitHub/GitLab
2. Connect your repository to Netlify
3. Deploy automatically

#### Option B: Manual Deploy
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify deploy --prod`

### 4. File Structure

```
/
├── index.html              # Main website file
├── netlify/
│   └── functions/
│       └── gemini-chat.js  # Serverless function for AI chat
├── package.json            # Dependencies
├── netlify.toml           # Netlify configuration
└── README.md              # This file
```

## Development

### Local Development
```bash
npm install
netlify dev
```

### Dependencies
- `@google/generative-ai`: Google Gemini AI integration
- `netlify-cli`: For local development and deployment

## Customization

### Adding Your Own Prompt
Edit the `systemPrompt` in `netlify/functions/gemini-chat.js` to customize the AI's personality and responses.

### Styling
The website uses CSS custom properties for easy theming. Main colors are defined in the `:root` selector in `index.html`.

### Content
All content is contained within the HTML file and can be easily modified.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Keyboard navigation support
- Screen reader compatible

## License

MIT License - Feel free to use and modify for your own spiritual guidance projects.
