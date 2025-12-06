# Looomy - Complete Documentation

AI-Powered YouTube Stream Chat Bot that answers audience questions using your custom knowledge base.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Architecture & How It Works](#architecture--how-it-works)
4. [Testing Guide](#testing-guide)
5. [QStash Integration](#qstash-integration)
6. [Cost Estimation](#cost-estimation)
7. [Troubleshooting](#troubleshooting)
8. [Project Structure](#project-structure)

---

## Overview

### Features

- **Knowledge Base**: Upload PDF/TXT documents that the bot learns from
- **YouTube Integration**: Connect your YouTube channel with OAuth
- **RAG-Powered Responses**: Uses OpenAI GPT-4o with context from your documents
- **Live Chat Bot**: Automatically responds to questions in your live stream chat
- **Adaptive Polling**: Adjusts polling intervals based on chat activity (2-30 seconds)
- **Message Deduplication**: Persistent ProcessedMessage table ensures no duplicate responses
- **Quota Management**: Global API quota tracking with automatic backoff
- **Multi-Stream Support**: Handles multiple concurrent streams independently

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Auth**: Clerk
- **Database**: PostgreSQL + Prisma
- **Vector DB**: Pinecone
- **AI**: OpenAI (GPT-4o)
- **Message Queue**: Upstash QStash
- **YouTube**: googleapis
- **Hosting**: Vercel

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Pinecone account
- OpenAI API key
- Clerk account
- Google Cloud project with YouTube Data API enabled
- Upstash QStash account

### Setup

1. **Clone the repository:**

```bash
git clone <repo-url>
cd looomy-stream-bot
```

2. **Install dependencies:**

```bash
npm install
```

3. **Copy environment variables:**

```bash
cp .env.example .env
```

4. **Fill in all environment variables in `.env`** (see [Environment Variables](#environment-variables))

5. **Generate Prisma client:**

```bash
npm run db:generate
```

6. **Push database schema:**

```bash
npm run db:push
```

7. **Start development server:**

```bash
npm run dev
```

8. **Open [http://localhost:3000](http://localhost:3000)**

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

### Service Setup

#### Clerk Webhook Setup

1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

#### Google Cloud Setup

1. Create a project in Google Cloud Console
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:3000/api/youtube/callback`
5. Copy client ID and secret to environment variables

#### Bot Account Setup

The bot requires a **separate YouTube channel** to reply in chat (like Nightbot). This allows the bot to have its own name and avatar instead of appearing as the streamer.

1. **Create a Bot YouTube Channel:**

   - Go to YouTube and create a new channel (e.g., "Looomy Bot")
   - Customize the channel name and avatar as desired

2. **Get Bot OAuth Token:**

   - Temporarily modify your app to allow signing in with the bot account
   - Go through the YouTube OAuth flow with the bot account
   - Copy the refresh token from the database
   - Add it to `BOT_YOUTUBE_REFRESH_TOKEN` in `.env`

3. **Configure Bot Details:**

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

#### QStash Setup

1. Create an account at [Upstash](https://upstash.com/)
2. Create a QStash project
3. Copy your QStash token to `QSTASH_TOKEN` in `.env`
4. Ensure `NEXT_PUBLIC_APP_URL` is set correctly for callbacks

**Important for Local Development**: QStash cannot reach `localhost`. Use ngrok:

```bash
ngrok http 3000
# Update NEXT_PUBLIC_APP_URL to ngrok URL
```

### Cron Jobs

The following cron jobs are configured in `vercel.json`:

- **Stream Cleanup** (`/api/bot/cleanup-streams`): Runs every 15 minutes
- **Message Cleanup** (`/api/bot/cleanup-messages`): Runs daily at 2 AM

---

## Architecture & How It Works

### The Big Picture

Think of it like a restaurant:

- **Cron Jobs** = The manager checking for new customers every few minutes
- **QStash** = Waiters serving each table independently
- **Stream Sessions** = Each table/customer
- **Polling** = Checking if customers need service

### Two Types of Jobs

#### 1. Cron Jobs (Vercel Cron) - The Manager

These run on a fixed schedule and handle **system-wide** tasks:

**🧹 Cleanup Jobs (Every 15 minutes & Daily)**

- Check for stale sessions (streams that ended)
- Delete old messages (older than retention period)
- Mark dead sessions as ENDED

#### 2. QStash Jobs - The Waiters

These handle **per-stream polling** - each stream gets its own independent polling schedule.

**📡 Polling Job (Per Stream, Adaptive Timing)**

- Fetches new messages from YouTube chat
- Processes messages (check trigger phrase, generate replies)
- Sends bot replies
- Schedules the NEXT poll (adaptive timing)

**Key Point:** Each stream polls independently with its own timing!

### Complete Flow

#### Step 1: User Starts Stream Monitoring

```
User clicks "Start Monitoring" in dashboard
  ↓
POST /api/streams/start-monitoring
  ↓
Checks for live YouTube streams
  ↓
If YES:
  - Creates StreamSession record
  - Calls QStash: "Start polling this stream!"
  ↓
QStash creates a job → Goes to Queues tab
```

#### Step 2: QStash Polls Stream (Per Stream)

```
QStash job executes: /api/bot/poll-stream/SESSION_ID
  ↓
Fetches messages from YouTube
  ↓
Processes each message:
  - Check if already processed (deduplication)
  - Check for trigger phrase (@looomybot)
  - Generate embedding → Query Pinecone → Generate AI response
  - Send reply
  ↓
Updates session (lastPolledAt, messageCount, etc.)
  ↓
Schedules NEXT poll (adaptive timing):
  - Active chat? Poll every 5 seconds
  - Idle chat? Poll every 20 seconds
  ↓
Creates new QStash job → Cycle continues
```

#### Step 4: Cleanup (Background Maintenance)

```
Every 15 minutes:
  - Check sessions not polled in >15 min
  - Mark as ENDED if stream is dead

Daily:
  - Delete messages older than retention period
```

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER ENABLES BOT                     │
│              (BotConfig.isActive = true)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         USER: Start Monitoring (On-Demand)            │
│  POST /api/streams/start-monitoring                   │
│                                                         │
│  • Check for live YouTube streams                     │
│  • Create StreamSession for each stream               │
│  • Schedule first QStash poll                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              QSTASH: Polling (Per Stream)              │
│  /api/bot/poll-stream/SESSION_ID                      │
│                                                         │
│  • Fetch messages from YouTube                        │
│  • Process messages (dedupe, trigger, reply)            │
│  • Schedule NEXT poll (adaptive timing)                │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │ Stream 1     │    │ Stream 2     │                  │
│  │ Polls every  │    │ Polls every  │                  │
│  │ 5 seconds    │    │ 20 seconds   │                  │
│  └──────────────┘    └──────────────┘                  │
│                                                         │
│  Each stream polls independently!                      │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         CRON: Cleanup (Every 15 min & Daily)          │
│                                                         │
│  • Mark stale sessions as ENDED                       │
│  • Delete old ProcessedMessage records                 │
└─────────────────────────────────────────────────────────┘
```

### Adaptive Polling Intervals

The bot uses **adaptive polling** - it adjusts how frequently it checks for messages based on chat activity.

#### Key Constants

```typescript
MIN_POLLING_INTERVAL = 2000ms (2 seconds)    // Fastest polling
MAX_POLLING_INTERVAL = 30000ms (30 seconds)  // Slowest polling
IDLE_MULTIPLIER = 4                          // Multiply by 4 when idle
ACTIVE_THRESHOLD = 3                         // Need 3+ empty polls to slow down
```

#### How It Works

1. **Track Activity**: Each poll checks if messages were found

   - Found messages? → Reset `consecutiveEmptyPolls` to 0
   - No messages? → Increment `consecutiveEmptyPolls` by 1

2. **Calculate Next Interval**:

   - If `consecutiveEmptyPolls >= 3` (idle chat): Slow down (multiply by 4, cap at 30s)
   - Else (active chat): Use platform recommended interval (usually 5s)

3. **Examples**:
   - **Active chat**: Polls every 5 seconds
   - **Chat goes quiet**: Gradually slows from 5s → 20s → 30s
   - **Chat becomes active again**: Immediately speeds up to 5s

### How QStash Stops When Stream Ends

**Mechanism**: QStash doesn't cancel jobs - the endpoint stops scheduling new ones.

1. **Cleanup detects ended stream** (every 15 min):

   - Session not polled in >15 minutes
   - Verifies stream is offline via YouTube API
   - Marks session as `ENDED` in database

2. **Next QStash poll call**:
   - Checks `session.status !== ACTIVE` → returns early
   - **Does NOT call `schedulePollJob()`**
   - Polling chain stops

**Other stop scenarios**:

- Bot disabled: Session marked `ENDED`, next poll skips
- Critical error: Session marked `ERROR`, polling stops
- Live chat ended: Session marked `ENDED` when YouTube returns 403 "liveChatEnded"
- Quota backoff: Polls skip but still schedule next (with longer delay)

### Why Two Systems?

**Cron Jobs (Vercel Cron):**

- ✅ Perfect for scheduled tasks (every 3 min, daily, etc.)
- ✅ Simple, reliable
- ❌ Can't easily do per-item scheduling
- ❌ All users processed in one run

**QStash:**

- ✅ Perfect for per-stream independent scheduling
- ✅ Adaptive timing (each stream polls at its own rate)
- ✅ Survives server restarts (jobs stored in QStash)
- ✅ Can handle thousands of streams independently

**Why Not Just Cron?**

- ❌ All streams poll at the same time (inefficient)
- ❌ Can't adapt timing per stream (active vs idle)
- ❌ One slow stream blocks others
- ❌ Hard to scale to many streams

---

## Testing Guide

### Quick Start (5 minutes)

#### 1. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Apply migration
npm run db:migrate

# Verify (optional)
npm run db:studio
```

#### 2. Configure Environment

Add to `.env`:

```bash
QSTASH_TOKEN="your-token-from-upstash"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BOT_POLL_SECRET="any-secret-string"
```

#### 3. Start Server

```bash
npm run dev
```

#### 4. Run Test Script

```bash
npm run test:local
```

Or manually test endpoints:

```bash
# Set your secret
export BOT_POLL_SECRET="your-secret"

# Test monitoring
curl -X GET http://localhost:3000/api/bot/monitoring \
  -H "Authorization: Bearer $BOT_POLL_SECRET"
```

### Testing with Real YouTube Stream

#### Step 1: Prepare

1. Connect YouTube account in dashboard
2. Upload a test document
3. Wait for embeddings to complete

#### Step 2: Go Live

1. Start a YouTube live stream
2. Enable bot in dashboard (`/dashboard`)

#### Step 3: Start Monitoring

Use the "Start Monitoring" button in the dashboard, or make a POST request:

```bash
curl -X POST http://localhost:3000/api/streams/start-monitoring \
  -H "Authorization: Bearer YOUR_CLERK_SESSION_TOKEN"
```

#### Step 4: Test Polling

Get session ID from database, then:

```bash
SESSION_ID="your-session-id-here"

curl -X POST http://localhost:3000/api/bot/poll-stream/$SESSION_ID \
  -H "Authorization: Bearer $BOT_POLL_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Step 5: Test Message

Send in YouTube chat:

```
@looomybot What is this about?
```

Then trigger poll again to see response.

### Verification Checklist

After setup, verify:

- [ ] Database tables exist (`StreamSession`, `ProcessedMessage`, `ApiQuota`)
- [ ] Discovery endpoint returns success
- [ ] Monitoring endpoint returns data
- [ ] Can create stream sessions
- [ ] Can poll streams manually
- [ ] Messages are deduplicated
- [ ] Bot responds to trigger phrases

---

## QStash Integration

### Understanding QStash Message Counts

**Important**: QStash counts **every HTTP request** (polling job) as a "message", not just bot replies.

**What QStash Counts:**

- Each time QStash executes a polling job, it counts as 1 "message"
- Poll executed → Counts as 1 message
- Poll executed → Counts as 1 message
- ... (continues)

**What Actually Happens in Each Poll:**

1. Fetches messages from YouTube chat
2. Checks each message:
   - Already processed? → Skip
   - Has trigger phrase (@looomybot)? → Process and reply
   - No trigger phrase? → Skip (no reply)
3. Schedules next poll

**Example:**

```
Poll #1:  Found 0 messages → No reply
Poll #2:  Found 1 message, no trigger → No reply
Poll #3:  Found 1 message, has trigger → ✅ REPLY SENT
Poll #4:  Found 0 messages → No reply
...
Poll #23: Found 1 message, has trigger → ✅ REPLY SENT
```

**Result:** 23 polls executed, but only 2 found messages that triggered replies.

This is **normal behavior**! The bot polls frequently to catch questions quickly.

### Where to Find QStash Jobs

**Important: Jobs Don't Appear in "Schedules" Tab!**

QStash has different tabs for different types of jobs:

**✅ Where Your Jobs Appear:**

1. **Queues Tab** - Pending jobs waiting to execute

   - Shows jobs that are scheduled but not yet executed
   - Look here immediately after starting stream monitoring

2. **Logs Tab** - Executed jobs (success/failure)
   - Shows all jobs that QStash has attempted to execute
   - Includes both successful and failed attempts
   - Shows the HTTP response from your endpoint

**❌ Where Jobs DON'T Appear:**

- **Schedules Tab** - This is ONLY for recurring cron-like schedules
- Our implementation uses one-time jobs (`publishJSON()`), not recurring schedules

### How to Check

1. **Start Monitoring:**

   - Use the "Start Monitoring" button in the dashboard, or
   - Make a POST request to `/api/streams/start-monitoring`

2. **Check QStash Dashboard:**

   - Go to **Queues** tab - You should see jobs with URL like: `https://your-ngrok-url.ngrok-free.dev/api/bot/poll-stream/SESSION_ID`
   - Wait a few seconds, then check **Logs** tab - You'll see the execution attempt

3. **Verify Your Endpoint is Accessible:**

```bash
curl -X POST https://your-ngrok-url.ngrok-free.dev/api/bot/poll-stream/SESSION_ID \
  -H "Authorization: Bearer YOUR_BOT_POLL_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Troubleshooting QStash

#### Jobs Not in Queues Tab?

1. **Check dev server logs** - Look for:

   - "Scheduled polling job for stream session" ✅ (success)
   - "Failed to schedule polling job" ❌ (error)

2. **Run test script:**

```bash
node scripts/test-qstash.js
```

3. **Check QStash token** - Verify it's correct in Upstash dashboard

#### Jobs in Queues But Not Executing?

1. **Check ngrok is running:**

```bash
ngrok http 3000
```

2. **Verify NEXT_PUBLIC_APP_URL matches ngrok URL:**

```bash
grep NEXT_PUBLIC_APP_URL .env
```

3. **Check Logs tab for errors** - QStash will show why execution failed

#### Jobs Executing But Getting Errors?

Check the **Logs** tab in QStash dashboard:

- **401 Unauthorized** → BOT_POLL_SECRET mismatch
- **404 Not Found** → Wrong endpoint URL
- **500 Internal Server Error** → Check your dev server logs
- **Connection Refused** → ngrok not running or wrong URL

#### Common Errors

| Error                   | Cause              | Solution                         |
| ----------------------- | ------------------ | -------------------------------- |
| "QSTASH_TOKEN required" | Token not in .env  | Add QSTASH_TOKEN to .env         |
| "Failed to schedule"    | Network/API error  | Check token, check QStash status |
| Jobs not executing      | localhost URL      | Use ngrok or deploy              |
| 401 Unauthorized        | Invalid token      | Regenerate token in Upstash      |
| 404 Not Found           | Wrong endpoint URL | Check NEXT_PUBLIC_APP_URL        |

### Quick Fix Checklist

- [ ] QSTASH_TOKEN is set in .env
- [ ] NEXT_PUBLIC_APP_URL is publicly accessible (not localhost)
- [ ] Dev server restarted after .env changes
- [ ] Check QStash dashboard → Logs tab (not Schedules)
- [ ] Check dev server logs for errors
- [ ] Verify endpoint is accessible: `curl https://your-url.ngrok.io/api/bot/poll-stream/TEST`

---

## Cost Estimation

### Overview

This section estimates the monthly costs to run Looomy for 100 concurrent streamers, assuming:

- Average stream duration: 2 hours
- Average polling interval: 5-10 seconds (active streams)
- Average chat activity: 10% of polls result in bot replies
- Each bot reply triggers: 1 embedding + 1 Pinecone query + 1 GPT-4o response

### Cost Breakdown (100 Concurrent Streamers)

#### 1. QStash (Message Queue) - $118/month

**Usage:**

- 100 concurrent streams
- Active streams (50%): Poll every 5 seconds = 12 polls/min
- Moderate streams (30%): Poll every 10 seconds = 6 polls/min
- Idle streams (20%): Poll every 30 seconds = 2 polls/min
- **Total: ~49,200 polls/hour = 393,600 polls/day = 11.8M polls/month**

**Pricing:**

- Pay-as-you-go: $1 per 100,000 messages
- **Cost: $118/month**

#### 2. OpenAI (Embeddings + GPT-4o) - $65/month

**Usage:**

- Embeddings: 1.18M/month (10% of polls trigger replies)
- GPT-4o responses: 944,640/month (80% find context)

**Pricing:**

- Embeddings: $0.47/month
- GPT-4o Input: $48.75/month
- GPT-4o Output: $15.70/month
- **Total: $64.92/month**

#### 3. Pinecone (Vector Database) - $0.11/month

**Usage:**

- 1.18M queries/month

**Pricing:**

- $0.096 per 1M queries
- **Cost: $0.11/month**

#### 4. YouTube API - $0/month

**Usage:**

- 11.8M API calls/month

**Pricing:**

- FREE (no cost)
- **Note**: At 393,600 polls/day, you'd need **197 YouTube API projects** (each with 10K quota/day)

#### 5. Vercel (Hosting/Serverless) - $452/month

**Usage:**

- 11.8M function invocations/month

**Pricing:**

- $20/month base
- Additional: $40 per 1M requests
- **Cost: $452/month**

#### 6. Database (PostgreSQL) - $25/month

**Usage:**

- ~30M DB queries/month

**Pricing:**

- Pro tier: $25/month

#### 7. Clerk (Authentication) - $25/month

**Usage:**

- 100 users (streamers)

**Pricing:**

- Pro tier: $25/month

#### 8. Other Services - $5/month

- Bandwidth: ~$5/month

### Total Monthly Cost

| Service         | Monthly Cost   | Notes                                  |
| --------------- | -------------- | -------------------------------------- |
| **QStash**      | $118           | Pay-as-you-go (11.8M messages)         |
| **OpenAI**      | $65            | Embeddings + GPT-4o responses          |
| **Pinecone**    | $0.11          | Vector queries (minimal)               |
| **YouTube API** | $0             | Free (but need 197 projects)           |
| **Vercel**      | $452           | Serverless hosting (11.8M invocations) |
| **Database**    | $25            | PostgreSQL (Pro tier)                  |
| **Clerk**       | $25            | Authentication (Pro tier)              |
| **Bandwidth**   | $5             | Network costs                          |
| **TOTAL**       | **$690/month** |                                        |

### Cost Optimization Strategies

#### 1. Reduce QStash Costs

- **Current**: $118/month
- **Optimize**: Use Fixed 10M Plan if consistently hitting 10M+ messages/day

#### 2. Reduce Vercel Costs

- **Current**: $452/month
- **Optimize**:
  - Use Vercel Enterprise for better pricing
  - Consider self-hosting API endpoints
  - Implement request batching
- **Potential savings**: 50-70% ($226-$316/month)

#### 3. Reduce OpenAI Costs

- **Current**: $65/month
- **Optimize**:
  - Use GPT-4o-mini for simpler queries
  - Cache common responses
  - Reduce context size
- **Potential savings**: 30-50% ($20-$33/month)

#### 4. Optimize Polling Frequency

- **Current**: 393,600 polls/day
- **Optimize**:
  - Increase idle stream polling to 60s (from 30s)
  - Use webhooks instead of polling (if YouTube supports)
- **Potential savings**: 30-40% on QStash + Vercel

### Optimized Cost Estimate

With optimizations:

- **QStash**: $80/month
- **OpenAI**: $45/month
- **Pinecone**: $0.11/month
- **YouTube API**: $0/month
- **Vercel**: $200/month
- **Database**: $25/month
- **Clerk**: $25/month
- **Bandwidth**: $5/month
- **TOTAL**: **$380/month** (45% reduction)

### Scaling Considerations

**At 1,000 Concurrent Streamers:**

- QStash: ~$1,180/month
- OpenAI: ~$650/month
- Vercel: ~$4,520/month
- **Total: ~$6,900/month**

**At 10,000 Concurrent Streamers:**

- QStash: ~$11,800/month
- OpenAI: ~$6,500/month
- Vercel: ~$45,200/month
- **Total: ~$69,000/month**

**Note**: At this scale, consider:

- Dedicated infrastructure
- Custom message queue (Kafka, RabbitMQ)
- Self-hosted API servers
- Enterprise pricing tiers

---

## Troubleshooting

### Common Issues

#### QStash Not Working Locally?

**Option 1: Use ngrok**

```bash
ngrok http 3000
# Update NEXT_PUBLIC_APP_URL to ngrok URL
```

**Option 2: Test Without QStash**
For local testing, you can manually trigger polls instead of relying on QStash scheduling.

#### Database Errors?

```bash
# Reset and reapply
npm run db:migrate
npm run db:generate
```

#### TypeScript Errors?

```bash
# Regenerate Prisma client
npm run db:generate

# Restart TS server in IDE
```

### Monitoring

Access system metrics at `/api/bot/monitoring` (requires `BOT_POLL_SECRET`):

```bash
curl -X GET http://localhost:3000/api/bot/monitoring \
    -H "Authorization: Bearer YOUR_BOT_POLL_SECRET"
```

### Where to See What

#### Cron Jobs (Vercel Dashboard)

- Go to Vercel → Your Project → Cron Jobs
- See: Discovery, Cleanup schedules
- Shows: When they last ran, next run time

#### QStash Jobs (Upstash Dashboard)

- Go to Upstash → QStash → **Queues** tab
- See: Pending polling jobs
- Go to **Logs** tab
- See: Executed polls, success/failure

#### Database (Prisma Studio)

```bash
npm run db:studio
```

- See: StreamSession records (active streams)
- See: ProcessedMessage records (all messages)
- See: ApiQuota records (API usage tracking)

### Common Questions

**Q: Why do I see jobs in QStash but not in Cron?**
A: They're different! Cron handles discovery/cleanup. QStash handles per-stream polling.

**Q: Do I need both?**
A: Yes! Cron finds streams and cleans up. QStash polls each stream independently.

**Q: What if QStash fails?**
A: The next discovery (every 3 min) will create a new session and try again.

**Q: What if Cron fails?**
A: QStash will keep polling existing streams, but new streams won't be discovered until cron runs again.

**Q: How do I know if it's working?**
A:

1. Check Vercel cron logs (discovery should run every 3 min)
2. Check QStash Queues tab (should see polling jobs)
3. Check QStash Logs tab (should see successful polls)
4. Check database (StreamSession records should exist)

---

## Project Structure

```
looomy-stream-bot/
├── app/                     # Next.js app directory
│   ├── (auth)/             # Login/signup pages
│   ├── (dashboard)/        # Protected routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── knowledge/      # Document upload
│   │   └── settings/       # Bot config + YouTube
│   └── api/                # API routes
│       ├── bot/            # Bot endpoints
│       │   ├── poll-stream/       # Per-stream polling
│       │   ├── cleanup-streams/   # Session cleanup
│       │   ├── cleanup-messages/   # Message cleanup
│       │   ├── monitoring/        # System metrics
│       │   ├── start/             # Enable bot
│       │   └── stop/              # Disable bot
│       ├── documents/       # Document management
│       ├── webhooks/       # Webhook handlers
│       └── youtube/        # YouTube OAuth
├── components/             # React components
│   ├── landing/           # Landing page components
│   ├── ui/                # UI components
│   └── ...                # Other components
├── lib/                    # Utilities & services
│   ├── adapters/          # Platform adapters (YouTube, etc.)
│   ├── adaptive-polling.ts  # Polling interval logic
│   ├── db.ts              # Prisma client
│   ├── message-processor.ts  # Message processing
│   ├── openai.ts         # OpenAI integration
│   ├── pinecone.ts       # Pinecone integration
│   ├── qstash.ts         # QStash integration
│   ├── quota.ts          # API quota management
│   ├── stream-discovery.ts  # Stream discovery logic
│   └── youtube.ts        # YouTube API wrapper
├── prisma/                 # Prisma schema & migrations
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── vercel.json            # Vercel configuration (cron jobs)
└── package.json
```

---

## Summary

**Cron = Manager** (finds new streams, cleans up)
**QStash = Waiters** (polls each stream independently)

They work together:

1. Cron finds streams → Creates sessions → Tells QStash to start polling
2. QStash polls each stream → Processes messages → Schedules next poll
3. Cron cleans up → Removes dead sessions and old messages

**Key Features:**

- ✅ Scalable architecture (handles 100+ concurrent streams)
- ✅ Adaptive polling (efficient resource usage)
- ✅ Message deduplication (no duplicate replies)
- ✅ Quota management (automatic backoff)
- ✅ Multi-platform ready (YouTube, Twitch, etc.)

**Cost at Scale:**

- 100 streamers: ~$690/month (base) or ~$380/month (optimized)
- Scales linearly with number of concurrent streams

---

## License

MIT
