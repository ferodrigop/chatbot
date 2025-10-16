# AI Chatbot

A production-ready Next.js 15 chatbot with AI streaming, Google authentication, and persistent conversation history.

## ✨ Features

- **AI-Powered Chat** - Streaming responses using Google Gemini 2.5 Flash
- **Google Sign-In** - Secure OAuth authentication via Supabase
- **Access Code Protection** - Prevent unauthorized signups with a secret code
- **Conversation History** - All chats saved to PostgreSQL database
- **Real-time Persistence** - Messages auto-save as you chat
- **Modern UI** - Built with shadcn/ui and Tailwind CSS
- **Responsive Design** - Works on all screen sizes
- **Markdown Support** - Code syntax highlighting included
- **Multiple Conversations** - Create and switch between chats

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works)
- Google Cloud Console access (for OAuth)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd chatbot
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ACCESS_CODE=your-secret-access-code
```

**Security Note:** Set a strong `ACCESS_CODE` to prevent unauthorized users from signing up and consuming your Supabase storage. This is validated server-side and never exposed to the browser. Only users with this code can proceed to Google OAuth sign-in.

### 3. Supabase Setup

Follow the detailed guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md):

1. Create Supabase project
2. Run database migration (`supabase/migrations/001_initial_schema.sql`)
3. Enable Google OAuth provider
4. Add Google OAuth credentials

### 4. Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to login.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router + Turbopack)
- **AI:** Vercel AI SDK v5 + Google Gemini
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)
- **UI:** shadcn/ui + Tailwind CSS v4
- **Language:** TypeScript

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # AI streaming endpoint
│   │   │   ├── conversations/ # CRUD endpoints
│   │   │   └── auth/          # Sign-out
│   │   ├── components/        # UI components
│   │   ├── login/             # Login page
│   │   └── page.tsx           # Main chat interface
│   ├── lib/
│   │   └── supabase/          # Supabase clients
│   └── components/ui/         # shadcn components
├── supabase/
│   └── migrations/            # Database schema
└── middleware.ts              # Auth protection
```

## 🔒 Security

- **Server-Side Access Code Validation** - Validates access code on the server, never exposed to browser
- **HttpOnly Cookie Tokens** - Temporary validation tokens stored securely
- **OAuth Callback Protection** - Prevents bypassing access code via direct OAuth URLs
- Row Level Security (RLS) enabled on all tables
- Users can only access their own conversations
- Protected routes via Next.js middleware
- OAuth tokens handled securely by Supabase

## 📝 License

MIT

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org), [Vercel AI SDK](https://sdk.vercel.ai), and [Supabase](https://supabase.com).
