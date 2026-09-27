# Bhu-Git — Setup & Development Guide

## Prerequisites

- Node.js 18.x or 20.x
- npm / pnpm / yarn
- Firebase Project (optional for local standalone mode)

---

## Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Required Variables:

```env
# Client Firebase Keys (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Server-Side Privileged Credentials (Private - NEVER commit)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Environment Mode
NEXT_PUBLIC_APP_ENV=development
```

*Note: If Firebase credentials are not provided, Bhu-Git automatically initializes a fully-functional local memory adapter mode so all features, maps, conflicts, and version history can be tested offline.*

---

## Local Development Execution

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open application in browser
# http://localhost:3000
```
