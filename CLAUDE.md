# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page React app with a Figma-like canvas (pan/zoom, resizable artboard) that generates PNG illustrations constrained to a fixed brand color palette and a specific flat-vector/geometric visual style. Originally scaffolded by Google AI Studio and built on Gemini; since migrated off AI Studio's secrets-injection model to a local `.env.local`, and now supports two image-generation providers behind a model-tier dropdown (see Architecture below).

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview the production build
- `npm run lint` — type-check only (`tsc --noEmit`); there is no separate lint config
- `npm run clean` — remove `dist/`

There is no test suite in this repo.

## Environment / secrets

- `GEMINI_API_KEY` and `OPENAI_API_KEY` must both be set in `.env.local` (see `.env.example`) — the former powers the free tier, the latter the paid tier (see Architecture below). `OPENAI_API_KEY` should be an API key from the org's OpenAI Platform account, not a ChatGPT Enterprise seat login; `gpt-image-1` additionally requires that org to have completed OpenAI's API organization verification.
- Vite's config (`vite.config.ts`) reads both keys via `loadEnv` and inlines them into the client bundle as `process.env.GEMINI_API_KEY` / `process.env.OPENAI_API_KEY`; the `OpenAI` client is constructed with `dangerouslyAllowBrowser: true`. **There is no server-side proxying** — both keys are embedded directly in the built JS bundle. This is acceptable for local dev/preview but must not be deployed anywhere publicly reachable without adding a backend proxy, since anyone who loads the page can extract the keys from the bundle and spend the org's (or your) API credits.

## Architecture

Almost the entire application lives in one file: `src/App.tsx` (~1200 lines). There is no router, no state management library, and no component directory — everything is local `useState`/`useRef`/`useEffect` inside the default-exported `App` component, plus one extracted subcomponent (`FigmaColorPicker`).

Key pieces inside `App.tsx`:
- **Canvas/viewport system**: manual pan (`pan` state) and zoom (`zoom` state) applied via CSS `transform`, driven by wheel events (ctrl/cmd+wheel = zoom, plain wheel = trackpad-style pan), spacebar-to-pan, and a hand/select tool toggle (`activeTool`). Corner/edge drag handles resize the artboard (`customWidth`/`customHeight`), auto-switching the active size preset to `custom`.
- **Size presets**: `PRESETS` defines fixed icon/scene dimensions; `selectedSize` plus a `isCustom` toggle decide whether `customWidth`/`customHeight` are used instead. Changing the preset triggers an effect that auto-picks a zoom level to keep the artboard visually reasonable.
- **Color palette system**: two tabs — `current` (locked brand palette, `CURRENT_COLORS`) and `custom` (user-editable, `customColors`, seeded from `DEFAULT_COLORS`). `FigmaColorPicker` is a draggable floating hex+alpha picker (built on `react-colorful`'s `HexAlphaColorPicker`) shared by both the palette swatches and the canvas background color control; `activePicker` tracks which swatch/target currently owns it (`'canvas'`, `-1` for "new color", or a palette index).
- **Generation flow** (`generateIllustration`): builds a large, strict system prompt that locks the model to the *active* color palette and to a specific flat-vector/2.5D geometric illustration style with mandatory black outlines and transparent backgrounds, then branches on `selectedModel.provider`:
  - `'gemini'` (free tier): calls `@google/genai`'s `GoogleGenAI.models.generateContent` with the user prompt as `contents` (+ optional uploaded reference image as inline base64) and the style prompt as `systemInstruction`; extracts the first inline PNG part from the response.
  - `'openai'` (paid tier): concatenates the style prompt and user prompt into a single string (OpenAI's Images API has no separate system/user roles) and calls the `openai` SDK's `images.generate` (no reference image) or `images.edit` (reference image provided, converted from its data-URL to a `File` via `dataUrlToFile`) with `model: 'gpt-image-1'`, `background: 'transparent'`, and a `size` chosen from OpenAI's three supported aspect ratios based on the canvas's width/height ratio; extracts `data[0].b64_json`.
  
  The canvas itself can be any custom pixel size regardless of provider, since the returned image is displayed with `object-contain` rather than at native resolution. Errors surface via the `error` state.
- **Model selection**: `MODELS` defines two tiers with a `provider: 'gemini' | 'openai'` discriminator — `gemini-2.5-flash-image` (free, `GEMINI_API_KEY`) and a `gpt-image-1` high-quality tier (paid, org-wide `OPENAI_API_KEY`) — selected via a dropdown. There is no per-user/bring-your-own-key flow; both keys come from `.env.local`.
- Output actions: copy the generated PNG to the clipboard (`ClipboardItem`, with a text-based fallback) and download it as a file.

Styling is Tailwind v4 (via `@tailwindcss/vite`, configured through `@theme` in `src/index.css` — no `tailwind.config.js`). Icons are `lucide-react`; animation/drag interactions use `motion/react` (Framer Motion).

`@/*` resolves to the project root (see `tsconfig.json` paths and the Vite alias) — currently unused by any import in `src/`.
