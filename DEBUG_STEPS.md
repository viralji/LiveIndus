# Step-by-Step Debugging Guide

## Step 1: Test Basic Function

1. **Deploy your site** with the new test function
2. **Open your website** in browser
3. **Open Developer Tools** (F12)
4. **Go to Console tab**
5. **Try sending a message** in Guruchat
6. **Check console** for any error messages

## Step 2: Check Function Logs

1. **Go to Netlify Dashboard**
2. **Click on your site**
3. **Go to "Functions" tab**
4. **Look for "gemini-chat-simple" function**
5. **Click on it to see logs**
6. **Try sending a message and check logs**

## Step 3: Test API Endpoint Directly

Open this URL in your browser (replace YOUR_SITE_NAME):
```
https://YOUR_SITE_NAME.netlify.app/.netlify/functions/gemini-chat-simple
```

You should see: `{"error":"Method not allowed"}` (this is expected for GET request)

## Step 4: Test with curl (if you have it)

```bash
curl -X POST https://YOUR_SITE_NAME.netlify.app/.netlify/functions/gemini-chat-simple \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

## Step 5: Check Environment Variables

1. **Go to Netlify Dashboard**
2. **Site Settings → Environment Variables**
3. **Make sure GEMINI_API_KEY is set**
4. **If not set, add it:**
   - Key: `GEMINI_API_KEY`
   - Value: Your API key from Google AI Studio

## Step 6: Common Issues

### Issue: Function not found (404)
**Solution:** Make sure your file structure is:
```
/
├── netlify/
│   └── functions/
│       ├── gemini-chat.js
│       ├── gemini-chat-simple.js
│       └── test-chat.js
```

### Issue: CORS errors
**Solution:** The functions include CORS headers, but try:
1. Clear browser cache
2. Try incognito/private mode
3. Check if function is deployed correctly

### Issue: "API key not configured"
**Solution:** 
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to Netlify environment variables
3. Redeploy site

### Issue: Still getting generic error
**Solution:** Check browser console for specific error messages

## Step 7: Test Progression

1. **First test:** Use `gemini-chat-simple` (should work without API)
2. **If that works:** Switch back to `gemini-chat` 
3. **If that fails:** The issue is with Gemini API integration

## Step 8: Switch Back to Full Function

Once the simple function works, change this line in index.html:
```javascript
// Change from:
const response = await fetch('/.netlify/functions/gemini-chat-simple', {

// Back to:
const response = await fetch('/.netlify/functions/gemini-chat', {
```

## Step 9: Final Test

1. **Set your API key** in Netlify environment variables
2. **Deploy the site**
3. **Test with a simple message** like "Hi"
4. **Check console and function logs** for any errors

## What to Look For

### In Browser Console:
- Network errors
- CORS errors
- JavaScript errors
- Response status codes

### In Netlify Function Logs:
- API key errors
- Gemini API errors
- Function execution errors
- Request/response details

### Expected Behavior:
- Simple function should return: "I received your message: [your message]..."
- Full function should return AI-generated spiritual guidance

## Still Having Issues?

1. **Check the exact error message** in browser console
2. **Check function logs** in Netlify dashboard
3. **Verify API key** is set correctly
4. **Try the test function first** to isolate the issue
