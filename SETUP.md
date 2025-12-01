# DevOps Dojo AI - Setup Guide

## Prerequisites
- Node.js 18+
- Vercel Account
- Clerk Account (for authentication)
- Google AI Studio Account (for Gemini API)

## 1. Environment Variables

Create a `.env.local` file with the following:

```bash
# Gemini API Key (Get from: https://aistudio.google.com/apikey)
VITE_API_KEY=your_gemini_api_key

# Clerk Authentication (Get from: https://dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# These are set automatically in Vercel when you create a Postgres database
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Set Up Clerk Authentication

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Enable Google OAuth and Email/Password authentication
4. Copy the Publishable Key to `.env.local`
5. Add your domain to allowed origins in Clerk dashboard

## 4. Set Up Vercel Postgres Database

### Option A: Via Vercel Dashboard (Recommended)
1. Go to your Vercel project
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres** (powered by Neon)
5. Click **Continue** and wait for provisioning
6. The environment variables will be automatically added

### Option B: Manual Setup
1. Create a Neon database at https://console.neon.tech
2. Copy the connection strings to your Vercel environment variables

## 5. Initialize Database Schema

After deploying to Vercel, run the schema initialization:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
npm run db:init

# Option 2: Manually run the schema
# Copy the contents of db/schema.sql and run it in your Postgres console
```

## 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# - VITE_API_KEY
# - VITE_CLERK_PUBLISHABLE_KEY
# - Database variables (auto-added if using Vercel Postgres)
```

## 7. Run Locally

```bash
npm run dev
```

## Features

### ✅ Authentication
- **Google OAuth** - Sign in with Google account
- **Email/Password** - Traditional email authentication
- **Secure** - Powered by Clerk

### ✅ Database Persistence
- User sessions saved to Postgres
- Tasks and resources synced across devices
- Config and preferences stored per user

### ✅ AI Features
- Gemini-powered productivity insights
- Topic suggestions
- AI chat assistant for DevOps learning

### ✅ Core Features
- Pomodoro timer (Focus/Break modes)
- Task planner
- Session history and analytics
- Dark/Light theme
- Zen mode for distraction-free focus

## Troubleshooting

### White Screen Issue
- Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Verify Clerk domain is whitelisted

### Database Connection Error
- Verify Postgres environment variables are set in Vercel
- Run the schema initialization script
- Check Vercel function logs for errors

### API Key Issues
- Gemini API key must start with `AI...`
- Make sure it's set as `VITE_API_KEY` (with VITE_ prefix)
- Check API quota in Google AI Studio

## Architecture

```
Frontend (React + Vite + Clerk)
    ↓
API Routes (/api/*.ts - Vercel Serverless Functions)
    ↓
Vercel Postgres (Neon)
```

## Support

For issues, please check:
- Vercel deployment logs
- Browser console errors
- Clerk dashboard for auth issues

