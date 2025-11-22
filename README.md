# Looomy

AI-Powered YouTube Stream Chat Bot that answers audience questions using your custom knowledge base.

## Features

- **Knowledge Base**: Upload PDF/TXT documents that the bot learns from
- **YouTube Integration**: Connect your YouTube channel with OAuth
- **RAG-Powered Responses**: Uses OpenAI GPT-4o with context from your documents
- **Live Chat Bot**: Automatically responds to questions in your live stream chat

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Monorepo**: TurboRepo
- **Styling**: Tailwind CSS + Shadcn/UI
- **Auth**: Clerk
- **Database**: PostgreSQL + Prisma
- **Vector DB**: Pinecone
- **AI**: OpenAI (GPT-4o)
- **YouTube**: googleapis

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Pinecone account
- OpenAI API key
- Clerk account
- Google Cloud project with YouTube Data API enabled

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd looomy
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp apps/web/.env.example apps/web/.env
```

4. Fill in all environment variables in `apps/web/.env`

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Push database schema:
```bash
npm run db:push
```

7. Start development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Your app URL (http://localhost:3000 for dev) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX` | Pinecone index name |
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `BOT_POLL_SECRET` | Secret for bot polling endpoint |

### Clerk Webhook Setup

1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

### Google Cloud Setup

1. Create a project in Google Cloud Console
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:3000/api/youtube/callback`
5. Copy client ID and secret to environment variables

### Bot Polling

The bot uses a polling endpoint (`/api/bot/poll`) that should be called periodically (every 5-10 seconds) when bots are active. You can set this up with:

- Vercel Cron Jobs
- External cron service (cron-job.org, etc.)
- Self-hosted scheduler

Example cron request:
```bash
curl -X POST https://your-domain.com/api/bot/poll \
  -H "Authorization: Bearer YOUR_BOT_POLL_SECRET"
```

## Project Structure

```
looomy/
├── apps/
│   └── web/                 # Next.js app
│       ├── app/
│       │   ├── (auth)/      # Login/signup pages
│       │   ├── (dashboard)/ # Protected routes
│       │   └── api/         # API routes
│       ├── components/      # React components
│       └── lib/             # Utilities
├── packages/
│   └── database/            # Prisma schema & client
├── turbo.json
└── package.json
```

## License

MIT
