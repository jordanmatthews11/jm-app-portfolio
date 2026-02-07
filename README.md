# JM App Portfolio — Personal Hub

Your hub: home (bio), portfolio of vibe-coded apps, Admin to add/edit apps, and a Tools page ready for later. The site is gated by Google sign-in.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Firebase setup (required for login and portfolio)

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** > **Sign-in method** > **Google**.
3. Create a **Firestore Database** (start in test mode or set rules as below).
4. Add a **Web app** in Project settings to get your config. Copy the env values.
5. Copy `.env.example` to `.env` and fill in:
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
   - Optional: `VITE_ALLOWED_EMAIL=your@gmail.com` to restrict access to a single account.
6. Deploy Firestore rules (Console > Firestore > Rules) from `firestore.rules` in this repo, or paste:
   - Read/write `portfolio` only when `request.auth != null`.

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Deploy and custom domain (jordan-matthews.com)

1. **Deploy** the app to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (push the repo to GitHub, then import it). Set all `VITE_*` env vars in the host's dashboard (Project/Site settings → Environment variables). Build command: `npm run build`. Publish directory: `dist`. `vercel.json` and `netlify.toml` in this repo configure SPA routing so `/portfolio`, `/admin`, etc. work on first load.
2. **Firebase**: In Firebase Console → Authentication → Settings → **Authorized domains**, add your deploy hostname (e.g. `xxx.vercel.app`) and `jordan-matthews.com`.
3. **Custom domain**: In Vercel (Project → Settings → Domains) or Netlify (Domain management), add `jordan-matthews.com` (and optionally `www`). The host will show the DNS records to add.
4. **Squarespace DNS**: For the domain jordan-matthews.com, open DNS settings and add the A/CNAME records the host provides (e.g. root → host IP or CNAME; `www` → host CNAME). Save and wait for DNS propagation (minutes to 48 hours). The host will then issue SSL for https.

## Features

- **Google login**: Required to access the site. Optionally restrict to one email via `VITE_ALLOWED_EMAIL`.
- **Admin** (`/admin`): Add apps with name and URL; optional description, tags, image URL. Edit and delete existing items. Data is stored in Firestore.
- **Portfolio** (`/portfolio`): Reads from Firestore; add items via Admin.
- **Share** (on each portfolio card): Copy, text, or email that app’s URL.

## Edit content

- **Home copy**: `src/pages/HomePage.jsx`
- **Portfolio items**: Use the **Admin** page (data in Firestore), or seed Firestore manually.
- **Add a real Tools page**: replace the placeholder in `src/pages/ToolsPage.jsx`

Routes: `/` (Home), `/portfolio`, `/tools`, `/admin`. Nav is in `src/components/Nav.jsx`.
