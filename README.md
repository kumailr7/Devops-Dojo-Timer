<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DevOps Dojo AI - Gemini-Powered Learning Timer

Master your time with AI-powered deep learning sessions. Track your progress, manage tasks, and get personalized insights.

## Features

✨ **Clerk Authentication** - Sign in with Google or Email  
⏱️ **Smart Pomodoro Timer** - Focus, Short Break, Long Break, Custom modes  
📊 **Analytics Dashboard** - Track your learning progress  
📝 **Task Planner** - Organize your learning objectives  
🤖 **AI Chat Assistant** - Get help from Gemini AI  
💾 **Database Persistence** - Your data synced across devices  
🎨 **Dark/Light Mode** - Choose your preferred theme  
🧘 **Zen Mode** - Distraction-free focus

## Prerequisites

- Node.js 18+
- Vercel Account
- Clerk Account (free)
- Neon Database (free)
- Google AI Studio Account (free)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk Authentication

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Enable **Google OAuth** and **Email/Password**
4. Copy the **Publishable Key**

### 3. Set Up Neon Database

1. Go to https://console.neon.tech
2. Create a new project called "Devops-Dojo"
3. Copy the **DATABASE_URL** connection string

### 4. Initialize Database Schema

Run this SQL in Neon SQL Editor (found in your Neon dashboard):

```sql
-- Copy and paste the entire contents of db/schema.sql
```

Or use the Neon SQL Editor to run the `db/schema.sql` file.

### 5. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Gemini API Key (Get from: https://aistudio.google.com/apikey)
VITE_API_KEY=your_gemini_api_key_here

# Clerk Authentication (Get from: https://dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Neon Database (Get from: https://console.neon.tech)
DATABASE_URL=postgresql://user:password@host/database
```

### 6. Run Locally

```bash
npm run dev
```

Open http://localhost:5173 and sign in!

## Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kumailr7/Devops-Dojo-Timer)

### Manual Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel Dashboard:
   - `VITE_API_KEY` - Your Gemini API key
   - `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
   - `DATABASE_URL` - Your Neon database URL

4. **Important**: Update Clerk Dashboard with your Vercel deployment URL in allowed origins

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_KEY` | Yes | Gemini API key from Google AI Studio |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key for authentication |
| `DATABASE_URL` | Yes (Production) | Neon PostgreSQL connection string |

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Authentication**: Clerk (Google OAuth + Email/Password)
- **Database**: Neon Postgres (Serverless)
- **AI**: Google Gemini 2.5 Flash & Gemini 3 Pro
- **Hosting**: Vercel
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure

```
Devops-Dojo-Timer/
├── api/                    # Vercel serverless functions
│   ├── sessions.ts        # Session logs API
│   ├── tasks.ts           # Tasks API
│   └── config.ts          # User config API
├── components/            # React components
├── services/             # Gemini AI service
├── db/                   # Database schema & queries
├── App.tsx              # Main application
└── index.tsx           # Entry point with Clerk provider
```

## Troubleshooting

### White Screen
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
- Check browser console for errors
- Ensure Clerk domain is whitelisted

### Database Errors
- Verify `DATABASE_URL` is set in Vercel
- Run schema initialization in Neon SQL Editor
- Check Vercel function logs

### AI Features Not Working
- Verify `VITE_API_KEY` is set correctly (must start with `AI...`)
- Check API quota in Google AI Studio
- Look for errors in browser console

## Support

For issues or questions:
- Check the [SETUP.md](./SETUP.md) for detailed setup guide
- Review Vercel deployment logs
- Inspect browser console errors

## License

MIT
