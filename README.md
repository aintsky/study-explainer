# Study Explainer

Camera-to-explanation homework helper built with Next.js, TypeScript, Tailwind, and client-side OCR.

## Features
- Chat-first UI that teaches instead of solving.
- Upload or camera capture with preview.
- Client-side OCR via Tesseract.js; editable extracted text.
- AI subject/topic detection and step-by-step explanations.
- Guardrails that refuse to provide final homework answers.
- Responsive glassmorphism UI.

## Stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Tesseract.js (OCR on device)
- OpenAI API (GPT-4o-mini by default)

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Add environment variables in `.env.local`
   ```bash
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-4o-mini # optional override
   ```
3. Run dev server
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

## Deployment
- Deploy to Vercel or GitHub Pages (via Next static export is not ideal because of API routes; prefer Vercel).
- Set the same environment variables in your hosting provider.

## Notes
- OCR happens in the browser; no image leaves the device during OCR.
- Server OCR placeholder exists at `app/api/ocr` for future providers.
- The AI route enforces refusal when users ask for the final answer.
- Keep photos well-lit for better OCR accuracy.
