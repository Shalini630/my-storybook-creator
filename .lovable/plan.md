

# Plan: Switch to Your Own OpenAI API Key

## Summary
Replace the Lovable AI gateway with direct OpenAI API calls using your own API key for text generation. Image generation will continue using the Lovable AI gateway (since OpenAI's DALL-E requires a different API pattern).

## Step 1: Add Your OpenAI API Key
- Use the `add_secret` tool to securely store your OpenAI API key as `OPENAI_API_KEY`
- You'll be prompted to paste your key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## Step 2: Update `generate-book/index.ts`
- Change API URL from `https://ai.gateway.lovable.dev/v1/chat/completions` → `https://api.openai.com/v1/chat/completions`
- Change auth header from `LOVABLE_API_KEY` → `OPENAI_API_KEY`
- Change model from `google/gemini-2.5-flash` → `gpt-4o` (or your preferred model)
- Keep image generation on Lovable AI gateway (Gemini image model)

## Step 3: Update `regenerate-page/index.ts`
- Same changes: swap URL, auth header, and model for the 2 text generation calls
- Keep the 2 image generation calls on Lovable AI gateway unchanged

## Step 4: Deploy & Test
- Deploy both edge functions
- Test with a sample book generation

## Technical Details
- **Text generation**: OpenAI API directly with your key (`gpt-4o`)
- **Image generation**: Stays on Lovable AI gateway (`google/gemini-3.1-flash-image-preview`) since it's free and works well
- Total changes: 4 fetch calls updated across 2 files

