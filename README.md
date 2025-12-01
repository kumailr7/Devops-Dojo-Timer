<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1djNRw315UWaDbV46E7bMnHFzqcpXrZtO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file and set your Gemini API key:
   ```
   VITE_API_KEY=your_gemini_api_key_here
   ```
   Get your API key from https://aistudio.google.com/apikey
3. Run the app:
   `npm run dev`

## Deploy to Vercel

When deploying to Vercel, add the environment variable:
- Variable name: `VITE_API_KEY`
- Value: Your Gemini API key
