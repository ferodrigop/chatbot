# Supabase Setup Guide

## 1. Create Supabase Project (2 minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign in/up
2. Click **"New Project"**
3. Fill in:
   - **Name**: `chatbot` (or any name)
   - **Database Password**: Choose a strong password (save it somewhere)
   - **Region**: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes for provisioning

---

## 2. Get Your API Keys (1 minute)

1. In your Supabase project dashboard, go to **Settings** (gear icon in sidebar)
2. Click **"API"** in the Settings menu
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

4. Create `.env.local` file in your project root:

```bash
# Copy from .env.example and fill in:
GOOGLE_GENERATIVE_AI_API_KEY=your-existing-key

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 3. Set Up Database (2 minutes)

1. In Supabase dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

You should see: ✅ Success. No rows returned

This creates:
- `conversations` table
- `messages` table  
- Row Level Security policies (users can only see their own data)

---

## 4. Enable Google OAuth (3 minutes)

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list and click it
3. Toggle **"Enable Sign in with Google"** to ON

### Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Click **"Create Credentials"** > **"OAuth client ID"**
4. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: `AI Chatbot`
   - User support email: your email
   - Developer email: your email
   - Save and continue through all steps
5. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Chatbot`
   - **Authorized redirect URIs**: Add this URL (replace with your Supabase project URL):
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

### Add to Supabase:

1. Back in Supabase Authentication > Providers > Google
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

---

## 5. Test It Out!

```bash
pnpm dev
```

1. Visit `http://localhost:3000`
2. You should be redirected to `/login`
3. Click **"Sign in with Google"**
4. Authorize the app
5. You should be redirected back and see the chat interface!
6. Send a message - it will be saved to your Supabase database
7. Refresh the page - your conversation persists! ✨

---

## Troubleshooting

### "Unauthorized" error
- Check that your `.env.local` file exists and has the correct values
- Restart your dev server after adding env variables

### Google OAuth redirect error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://your-project-id.supabase.co/auth/v1/callback`
- Check that Google provider is enabled in Supabase

### Database errors
- Verify the SQL migration ran successfully
- Check the Tables tab in Supabase to confirm `conversations` and `messages` tables exist

### Can't see old messages
- Conversations are tied to user accounts
- Sign in with the same Google account to see previous chats

---

## What's Included

✅ **Google Sign-In** - Secure OAuth authentication  
✅ **Protected Routes** - Middleware redirects unauthenticated users to /login  
✅ **Database Persistence** - All conversations and messages saved  
✅ **Row Level Security** - Users can only access their own data  
✅ **Auto-save** - Messages saved as you chat  
✅ **New Chat** - Create multiple conversation threads  

---

## Next Steps (Optional)

- **Add conversation history sidebar** to browse past chats
- **Add conversation titles** (first message as title)
- **Add delete conversation** functionality
- **Deploy to Vercel** (env variables are already configured)
