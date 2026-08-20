# Current Illustration Generator

A browser-based illustration generator with a Figma-like canvas (pan/zoom, resizable artboard) that generates PNG illustrations constrained to a fixed brand color palette and a specific flat-vector/geometric visual style. Two model tiers are available: a free tier (Gemini `gemini-2.5-flash-image`) and a paid tier (OpenAI `gpt-image-1`, billed to the org account).

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `GEMINI_API_KEY` — for the free tier, from https://aistudio.google.com/app/apikey
   - `OPENAI_API_KEY` — for the paid tier, an API key from your org's OpenAI Platform account (https://platform.openai.com/api-keys — note this is separate from a ChatGPT Enterprise seat login, and the org needs API organization verification to use `gpt-image-1`)
3. Run the app:
   `npm run dev`
4. Open http://localhost:3000

See [CLAUDE.md](CLAUDE.md) for architecture notes and other commands (build, type-check, etc).
