# AI Features Setup Guide

## How to Enable AI Writing Assistant

The AI writing assistant requires an OpenAI API key to function. Here's how to set it up:

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-...`)
5. **Important:** Keep this key secure and never share it

### Step 2: Add API Key to the App

1. Open **AI Notes** in your browser
2. Click the **Settings** icon (⚙️) in the sidebar
3. Go to the **"AI Settings"** tab
4. Paste your API key in the **"OpenAI API Key"** field
5. Click **"Save API Key"**
6. (Optional) Click **"Test Connection"** to verify it works

### Step 3: Choose Your AI Model

- **gpt-4o-mini** (Recommended) - Fast, affordable, great quality
  - Cost: ~$0.0002 per request
  - Best for: Most use cases

- **gpt-4-turbo** - Most capable, slower, more expensive
  - Cost: ~$0.002 per request
  - Best for: Complex writing tasks

### Step 4: Use AI Features

Select any text in your notes, and you'll see AI options appear:

1. **Improve Writing** - Enhance clarity and flow
2. **Fix Grammar** - Correct spelling and grammar
3. **Make Shorter** - Condense text
4. **Make Longer** - Expand with more detail
5. **Professional Tone** - Make it formal
6. **Casual Tone** - Make it conversational

## Security & Privacy

- **Your API key is stored locally** in your browser's localStorage
- **No backend server** - API calls go directly from your browser to OpenAI
- **Your notes are private** - Only sent to OpenAI when you use AI features
- **You control costs** - Monitor usage at [OpenAI Dashboard](https://platform.openai.com/usage)

## Troubleshooting

### "No API key found"
→ Add your API key in Settings → AI Settings

### "Invalid API key"
→ Check that you copied the key correctly (starts with `sk-`)
→ Make sure the key hasn't been revoked

### "Rate limit exceeded"
→ The app limits to 10 AI requests per minute
→ Wait 1 minute and try again

### AI features not appearing
→ Make sure you've selected text in the editor
→ Check that AI is enabled in Settings → AI Settings

## Cost Estimates

Using **gpt-4o-mini** (recommended):

- **Typical usage:** 50 AI actions/month = ~$0.01-0.02/month
- **Heavy usage:** 500 AI actions/month = ~$0.10-0.20/month

The app uses efficient prompts to minimize token usage.

## Next Steps

1. ✅ Add your API key
2. ✅ Test with a sample note
3. ✅ Try different AI actions
4. ✅ Monitor your usage on OpenAI dashboard

Need help? Check the OpenAI documentation or open an issue on GitHub.
