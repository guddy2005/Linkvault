# LinkVault - Gamified URL Shortener

A production-ready, visually stunning URL Shortener with a gamified progression system. Built with Next.js 14+, Firebase, and Tailwind CSS.

## Features

### Core Features
- URL Shortening with unique 6-character nanoid slugs
- Real-time click tracking and analytics
- QR Code generation for links
- Password-protected links
- Custom aliases for links

### Gamification System
- **XP System**: +1 XP for every click your links receive
- **Level Progression**:
  - Level 1 (0 XP): Basic shortening
  - Level 5 (50 XP): Unlocks QR Code generation
  - Level 10 (200 XP): Unlocks Password-protected URLs
  - Level 20 (500 XP): Unlocks Custom Aliases

### Visual Design
- Dark mode with Cyberpunk Purple/Blue neon accents
- Glassmorphism effects with translucent backgrounds
- Bento Grid masonry layout for dashboard
- Smooth animations with Framer Motion
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend/DB**: Firebase V9 (Modular SDK)
- **Auth**: Firebase Authentication (Google & GitHub)
- **Database**: Cloud Firestore

## Folder Structure

linkvault/
├── src/
│ ├── app/
│ │ ├── (redirect)/[slug]/ # Redirect handler
│ │ ├── api/
│ │ │ └── shorten/ # API routes
│ │ ├── auth/
│ │ │ └── login/ # Login page
│ │ ├── dashboard/ # User dashboard
│ │ ├── r/[slug]/ # Server-side redirect
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ ├── page.tsx # Landing page
│ │ └── providers.tsx
│ ├── components/
│ │ ├── dashboard/
│ │ │ ├── CreateLinkForm.tsx
│ │ │ ├── LevelCard.tsx
│ │ │ ├── LinkCard.tsx
│ │ │ ├── RecentActivity.tsx
│ │ │ └── StatsCard.tsx
│ │ └── ui/
│ │ ├── Button.tsx
│ │ ├── GlassCard.tsx
│ │ ├── Input.tsx
│ │ └── ProgressBar.tsx
│ ├── config/
│ │ ├── firebase.ts # Client SDK
│ │ └── firebase-admin.ts # Admin SDK
│ ├── hooks/
│ │ └── useAuth.ts
│ ├── lib/
│ │ ├── firebase-utils.ts # All Firebase operations
│ │ └── utils.ts
│ └── types/
│ └── index.ts
├── middleware.ts
├── .env.example
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── package.json
├── tailwind.config.ts
└── tsconfig.json


## Setup Instructions

### 1. Clone and Install

git clone <your-repo>
cd linkvault
npm install


### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Google & GitHub providers)
4. Create a Firestore database
5. Get your config from Project Settings > General
6. Generate a new private key from Project Settings > Service Accounts

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

cp .env.example .env.local


### 4. Deploy Firestore Rules

firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes


### 5. Run Development Server

npm run dev


## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

vercel --prod


### Option 2: Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy:

npm run build
firebase deploy


## Firestore Data Model

### Users Collection (`/users/{userId}`)
- uid: string
- email: string
- displayName: string
- photoURL: string | null
- totalXP: number
- level: number
- createdAt: timestamp
- updatedAt: timestamp

### Links Collection (`/links/{slug}`)
- originalUrl: string
- shortSlug: string
- customAlias: string | null
- createdAt: timestamp
- updatedAt: timestamp
- clickCount: number (denormalized for performance)
- userId: string
- isPasswordProtected: boolean
- password: string | null
- expiresAt: timestamp | null
- isActive: boolean

### Clicks Subcollection (`/links/{slug}/clicks/{clickId}`)
- timestamp: timestamp
- userAgent: string
- deviceType: string
- referrer: string | null

## API Routes

### POST /api/shorten
Creates a new short link.

Request:
{
"url": "https://example.com",
"userId": "optional-user-id",
"customAlias": "optional-alias",
"password": "optional-password"
}


## Performance Optimizations

1. **Minimized Firestore Reads**: Click count stored on link document (not counting subcollection)
2. **Real-time Subscriptions**: Dashboard uses onSnapshot for live updates
3. **Atomic Transactions**: Click + XP increments happen atomically
4. **Edge Middleware**: Fast redirect interception

## License

MIT License
