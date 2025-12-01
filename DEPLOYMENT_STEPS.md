# Quick Deployment Steps

## ✅ What's Been Done

1. ✅ Clerk authentication integrated (Google OAuth + Email/Password)
2. ✅ Neon database connected
3. ✅ Database schema created (`db/schema.sql`)
4. ✅ API routes created for data persistence
5. ✅ Speed Insights added
6. ✅ All code committed to git

## 🚀 Next Steps to Deploy

### 1. Initialize Database

In your Neon SQL Editor (https://console.neon.tech), run:

```sql
-- Copy and paste the ENTIRE contents of db/schema.sql
-- This creates all the tables: users, session_logs, tasks, resources, user_config
```

### 2. Get Your API Keys

#### Clerk (Authentication)
1. Go to https://dashboard.clerk.com
2. Click your app → **API Keys**
3. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)

#### Gemini AI
1. Go to https://aistudio.google.com/apikey
2. Click **Create API Key**
3. Copy the key (starts with `AI...`)

### 3. Add Environment Variables to Vercel

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these THREE variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Production, Preview, Development |
| `VITE_API_KEY` | `AIza...` | Production, Preview, Development |
| `DATABASE_URL` | *(Already set by Neon)* | Production, Preview, Development |

### 4. Update Clerk Settings

1. Go to https://dashboard.clerk.com
2. Click your app → **Domains**
3. Add your Vercel domain (e.g., `devops-dojo.vercel.app`)
4. Save changes

### 5. Deploy to Vercel

**Option A - Git Push (Recommended)**
```bash
cd /home/cdblz-nb-018/CodeBlaze/Personal/dojo-planner/Devops-Dojo-Timer
git push origin main
```
*(Note: You'll need to fix the GitHub auth token first)*

**Option B - Vercel CLI**
```bash
cd /home/cdblz-nb-018/CodeBlaze/Personal/dojo-planner/Devops-Dojo-Timer
vercel --prod
```

### 6. Test Your Deployment

1. Visit your Vercel URL
2. Click **"Sign In with Google or Email"**
3. Sign in with your Google account
4. Start a timer session
5. Check Neon database to verify data is being saved:
   ```sql
   SELECT * FROM users;
   SELECT * FROM session_logs;
   ```

## 🎉 What You Get

### Authentication
- ✅ Google OAuth login
- ✅ Email/Password login
- ✅ Secure session management
- ✅ User profile with avatar

### Data Persistence
- ✅ Session logs saved to database
- ✅ Tasks synced across devices
- ✅ User preferences stored
- ✅ Resources tracked per session

### AI Features
- ✅ Productivity insights from Gemini
- ✅ Topic suggestions
- ✅ AI chat assistant for DevOps learning

## 🐛 Troubleshooting

### "White screen after login"
- Check browser console for errors
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set
- Make sure Clerk domain is whitelisted

### "Database connection error"
- Verify `DATABASE_URL` is set in Vercel
- Check that schema was run in Neon SQL Editor
- Review Vercel function logs

### "AI features not working"
- Verify `VITE_API_KEY` is set correctly
- Check API quota in Google AI Studio
- API key should start with `AI...`

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments and function logs
- **Clerk Dashboard**: View user signups and sessions
- **Neon Console**: Query database and monitor usage
- **Speed Insights**: Track app performance

## 🔐 Security Notes

- ✅ All API keys are server-side only (except VITE_ prefixed ones)
- ✅ Clerk handles all authentication securely
- ✅ Database connections use SSL by default
- ✅ User data is isolated per account

## Need Help?

1. Check `SETUP.md` for detailed configuration
2. Review `README.md` for features and tech stack
3. Check Vercel deployment logs for errors
4. Inspect browser console for client errors

