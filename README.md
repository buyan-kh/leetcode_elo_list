# LeetCode Rating Tracker

A Next.js application for tracking LeetCode problem progress with user authentication and cloud storage.

## Features

- 🔐 User authentication with Supabase (login/signup)
- 📊 Track solved problems per user
- 🎯 Filter by rating range
- 📈 Progress tracking with ELO calculation
- 🌓 Dark/Light theme toggle
- 📱 Responsive design

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Copy your project URL and anon key from Settings > API

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Add your LeetCode problems data:**
   - Place your `data.json` file in the `public/` directory
   - The file should be an array of problems with this structure:
     ```json
     [
       {
         "ID": 1,
         "Title": "Two Sum",
         "TitleSlug": "two-sum",
         "Rating": 1200
       }
     ]
     ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Deploy!

The app will be automatically deployed on every push to your main branch.

## Database Schema

The app uses a `user_progress` table in Supabase to store solved problems:

- `id`: UUID primary key
- `user_id`: References auth.users
- `problem_id`: Integer (LeetCode problem ID)
- `solved_at`: Timestamp
- Row Level Security enabled (users can only see/modify their own progress)

## Project Structure

```
├── app/
│   ├── auth/
│   │   ├── login/        # Login page
│   │   └── signup/       # Signup page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main tracker page
├── components/           # React components
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
├── public/
│   └── data.json        # LeetCode problems data
├── supabase/
│   └── schema.sql       # Database schema
└── types/
    └── index.ts         # TypeScript types
```

## License

MIT
