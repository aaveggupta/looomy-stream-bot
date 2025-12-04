# Looomy

AI-Powered YouTube Stream Chat Bot that answers audience questions using your custom knowledge base.

## Features

- **Knowledge Base**: Upload PDF/TXT documents that the bot learns from
- **YouTube Integration**: Connect your YouTube channel with OAuth
- **RAG-Powered Responses**: Uses OpenAI GPT-4o with context from your documents
- **Live Chat Bot**: Automatically responds to questions in your live stream chat

## Tech Stack

- **Framework**: Next.js 14 (App Router)
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
cp .env.example .env
```

4. Fill in all environment variables in `.env`

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

| Variable                            | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`               | Your app URL (http://localhost:3000 for dev) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                        |
| `CLERK_SECRET_KEY`                  | Clerk secret key                             |
| `CLERK_WEBHOOK_SECRET`              | Clerk webhook signing secret                 |
| `DATABASE_URL`                      | PostgreSQL connection string                 |
| `PINECONE_API_KEY`                  | Pinecone API key                             |
| `PINECONE_INDEX`                    | Pinecone index name                          |
| `OPENAI_API_KEY`                    | OpenAI API key                               |
| `GOOGLE_CLIENT_ID`                  | Google OAuth client ID                       |
| `GOOGLE_CLIENT_SECRET`              | Google OAuth client secret                   |
| `GOOGLE_REDIRECT_URI`               | OAuth callback URL                           |
| `BOT_YOUTUBE_REFRESH_TOKEN`         | Bot account's YouTube refresh token          |
| `NEXT_PUBLIC_BOT_CHANNEL_NAME`      | Bot's YouTube channel name (displayed in UI) |
| `NEXT_PUBLIC_BOT_CHANNEL_URL`       | Bot's YouTube channel URL                    |
| `BOT_POLL_SECRET`                   | Secret for bot polling endpoint              |
| `QSTASH_TOKEN`                      | Upstash QStash token for job scheduling      |
| `NEXT_PUBLIC_APP_URL`               | Your app URL (required for QStash callbacks) |

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

### Bot Account Setup

The bot requires a **separate YouTube channel** to reply in chat (like Nightbot). This allows the bot to have its own name and avatar instead of appearing as the streamer.

1. **Create a Bot YouTube Channel**:

   - Go to YouTube and create a new channel (e.g., "Looomy Bot")
   - Customize the channel name and avatar as desired

2. **Get Bot OAuth Token**:

   - Temporarily modify your app to allow signing in with the bot account
   - Go through the YouTube OAuth flow with the bot account
   - Copy the refresh token from the database
   - Add it to `BOT_YOUTUBE_REFRESH_TOKEN` in `.env`

3. **Configure Bot Details**:

   ```bash
   BOT_YOUTUBE_REFRESH_TOKEN=<bot_refresh_token>
   NEXT_PUBLIC_BOT_CHANNEL_NAME=Looomy Bot
   NEXT_PUBLIC_BOT_CHANNEL_URL=https://www.youtube.com/@looomy-bot
   ```

4. **Add Bot as Moderator** (Users must do this):
   - Each streamer must add your bot channel as a moderator
   - Go to YouTube Studio > Settings > Community
   - Under "Managing moderators", add the bot's channel URL
   - The bot will now be able to send messages in their live chat

### Bot Architecture

The bot uses a scalable, multi-platform architecture:

- **Stream Discovery**: Automatically discovers active streams every 3 minutes
- **Per-Stream Polling**: Each stream session is polled independently with adaptive intervals
- **Message Deduplication**: Persistent ProcessedMessage table ensures no duplicate responses
- **Adaptive Polling**: Polling intervals adjust based on chat activity (2-30 seconds)
- **Quota Management**: Global API quota tracking with automatic backoff
- **Cleanup Jobs**: Automatic cleanup of old messages and stale sessions

### Cron Jobs

The following cron jobs are configured in `vercel.json`:

- **Stream Discovery** (`/api/bot/discover-streams`): Runs every 3 minutes
- **Stream Cleanup** (`/api/bot/cleanup-streams`): Runs every 15 minutes
- **Message Cleanup** (`/api/bot/cleanup-messages`): Runs daily at 2 AM

### QStash Setup

1. Create an account at [Upstash](https://upstash.com/)
2. Create a QStash project
3. Copy your QStash token to `QSTASH_TOKEN` in `.env`
4. Ensure `NEXT_PUBLIC_APP_URL` is set correctly for callbacks

### Monitoring

Access system metrics at `/api/bot/monitoring` (requires `BOT_POLL_SECRET`):

```bash
curl -X GET http://localhost:3000/api/bot/discover-streams \
    -H "Authorization: Bearer vIlBRSo23NL5xdPMaMR+2eaH+YUrpLLN+TkUtBS20bE="
```

## Project Structure

```
looomy-stream-bot/
├── app/                     # Next.js app directory
│   ├── (auth)/             # Login/signup pages
│   ├── (dashboard)/        # Protected routes
│   └── api/                # API routes
├── components/             # React components
├── lib/                    # Utilities & database client
├── prisma/                 # Prisma schema & migrations
├── public/                 # Static assets
└── package.json
```

## License

MIT
