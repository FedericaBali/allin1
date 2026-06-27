# Allin1 Calendar App - Setup Instructions

Node.js is not currently installed on this machine. Follow these steps to get the app running.

## Step 1: Install Node.js

Download and install Node.js 20 LTS from: https://nodejs.org/en/download

## Step 2: Install dependencies

Open PowerShell in C:\Users\Federica\Desktop\TEST 1\allin1 and run:

```powershell
npm install
```

## Step 3: Run tests (TDD - red first, then green)

```powershell
npm run test:run
```

## Step 4: Build the app

```powershell
npm run build
```

## Step 5: Run locally

```powershell
npm run dev
```

Open http://localhost:5173

## Step 6: Configure Supabase Auth providers

In your Supabase dashboard (https://supabase.com/dashboard/project/znephwddyteevuuqfhry):

1. Go to Authentication > Providers
2. Enable Google: add Google Client ID and Secret from Google Cloud Console
   - Scope: https://www.googleapis.com/auth/calendar
3. Enable Azure (Microsoft): add Azure App Client ID and Secret
   - Scope: Calendars.ReadWrite offline_access
4. Set redirect URL to your Netlify domain

## Step 7: Deploy to Netlify

```powershell
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Or connect the GitHub repo to Netlify team: fe615615

Set these environment variables in Netlify dashboard:
- VITE_SUPABASE_URL=https://znephwddyteevuuqfhry.supabase.co
- VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## Database

The Supabase events table has already been created with RLS policies.
Migration file: supabase_migration.sql (already applied)
