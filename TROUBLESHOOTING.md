# Guruchat Troubleshooting Guide

## Common Issues and Solutions

### 1. "Sorry, I encountered an error. Please try again."

This is the generic error message. Here's how to debug:

#### Check Browser Console
1. Open your website
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Try sending a message in Guruchat
5. Look for error messages in the console

#### Check Netlify Function Logs
1. Go to your Netlify dashboard
2. Click on your site
3. Go to "Functions" tab
4. Click on "gemini-chat" function
5. Check the logs for error details

### 2. API Key Issues

**Error: "API configuration error. Please check your Gemini API key."**

**Solution:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Make sure `GEMINI_API_KEY` is set correctly
3. Get a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Update the environment variable
5. Redeploy your site

### 3. CORS Issues

**Error: CORS policy errors in browser console**

**Solution:**
The function already includes CORS headers, but if you still see issues:
1. Check that the function is deployed correctly
2. Verify the netlify.toml file is in your root directory
3. Try clearing browser cache

### 4. Function Not Found

**Error: 404 or function not found**

**Solution:**
1. Make sure your file structure is correct:
   ```
   /
   ├── netlify/
   │   └── functions/
   │       └── gemini-chat.js
   ```
2. Check that netlify.toml exists in root directory
3. Redeploy your site

### 5. Testing Locally

To test the function locally:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Start local development:**
   ```bash
   netlify dev
   ```

3. **Set environment variable:**
   ```bash
   netlify env:set GEMINI_API_KEY your_api_key_here
   ```

4. **Test the function:**
   ```bash
   node test-function.js
   ```

### 6. Debug Steps

1. **Check Environment Variables:**
   - Go to Netlify Dashboard
   - Site Settings → Environment Variables
   - Verify `GEMINI_API_KEY` exists and is correct

2. **Check Function Deployment:**
   - Go to Functions tab in Netlify
   - Verify `gemini-chat` function is listed
   - Check function logs for errors

3. **Test API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Test your API key in the playground

4. **Check Network Tab:**
   - Open Developer Tools → Network tab
   - Send a message in Guruchat
   - Look for the request to `/.netlify/functions/gemini-chat`
   - Check the response status and content

### 7. Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "API key not configured" | Missing GEMINI_API_KEY | Set environment variable in Netlify |
| "API quota exceeded" | Gemini API limit reached | Wait or upgrade API plan |
| "Your message was filtered for safety" | Content flagged by Gemini | Rephrase your message |
| "Network response was not ok" | Function error | Check function logs |
| "No response from API" | Empty response | Check function implementation |

### 8. Still Having Issues?

1. **Check the updated function code** - Make sure you have the latest version
2. **Redeploy your site** - Sometimes a fresh deployment fixes issues
3. **Test with a simple message** - Try just "Hi" first
4. **Check browser compatibility** - Try a different browser
5. **Clear browser cache** - Hard refresh (Ctrl+F5)

### 9. Getting Help

If you're still having issues:
1. Check the browser console for specific error messages
2. Check Netlify function logs
3. Verify your API key is working
4. Make sure all files are deployed correctly

The most common issue is the API key not being set correctly in Netlify's environment variables.
