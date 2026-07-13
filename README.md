# LeetCode Rating Tracker

A Next.js application for tracking LeetCode problem progress with browser local storage.

## Features

- 🔐 Local browser accounts for login/signup
- 📊 Track solved problems per local user
- 🎯 Filter by rating range
- 📈 Progress tracking with ELO calculation
- 🌓 Dark/Light theme toggle
- 📱 Responsive design

## Prerequisites

- Node.js 18+ installed

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your LeetCode problems data:**
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

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Deploy!

The app will be automatically deployed on every push to your main branch.

## Local Database

The app stores all account and progress data in browser `localStorage`:

- `lc-tracking-accounts`: local account list
- `lc-tracking-session`: current browser session
- `lc-tracking-progress:<userId>`: solved problem timestamps per local user

No remote database or environment variables are required.

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
│   ├── localDb.ts       # Browser local database
│   └── utils.ts         # Utility functions
├── public/
│   └── data.json        # LeetCode problems data
└── types/
    └── index.ts         # TypeScript types
```

## License

MIT
