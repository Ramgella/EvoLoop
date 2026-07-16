# EvoLoop

**Professional Identity Evolution Platform** — Sprint 1 (foundation).

Sprint 1 covers email/password authentication, a protected dashboard, and an editable user profile, built on React + Vite, FastAPI, and Supabase (Postgres + Auth).

```
EvoLoop/
├── frontend/          React + Vite app (auth UI, dashboard, settings)
├── backend/           FastAPI API (profile endpoints, token verification)
│   └── database/
│       └── schema.sql Supabase schema: profiles table, RLS, triggers
└── README.md
```

## Architecture

```
Browser (React)
  │  supabase-js: sign up / sign in / sign out, session persisted in localStorage
  │
  ├──► Supabase Auth
  │
  └──► FastAPI  (Authorization: Bearer <user access token>)
          │  1. verifies the token with Supabase Auth  (/auth/v1/user)
          │  2. reads/writes `profiles` via PostgREST using the SAME user token
          ▼
       Supabase Postgres  — Row Level Security: auth.uid() = id
```

The backend only uses the **anon/publishable key** and forwards each user's token, so Postgres RLS enforces that a user can only see and change their own profile. No service-role key is needed or used.

---

## 1. Supabase setup

1. Create a project at <https://supabase.com/dashboard>.
2. Go to **SQL Editor → New query**, paste the contents of [`backend/database/schema.sql`](backend/database/schema.sql), and click **Run**. This creates:
   - the `profiles` table (`id`, `full_name`, `email`, `headline`, `bio`, `created_at`, `updated_at`)
   - RLS policies: authenticated users can `select`, `insert`, and `update` only the row where `id = auth.uid()`
   - a trigger that keeps `updated_at` current
   - a trigger that creates a profile automatically when a user signs up
3. Go to **Authentication → Sign In / Providers** and make sure **Email** is enabled.
   - *Confirm email* **on** (default): after signup, users must click the link in their email before signing in.
   - *Confirm email* **off**: users are signed in right after signup. This is easier for local testing.
4. Go to **Authentication → URL Configuration** and set **Site URL** to `http://localhost:5173`, so confirmation links bring users back to the local app.
5. Go to **Project Settings → API** (or **API Keys**) and copy the **Project URL** and the **anon / publishable** key.

> The free Supabase email service is rate-limited to a few emails per hour. If confirmation emails stop arriving, turn off *Confirm email* while you develop.

## 2. Environment variables

Never commit `.env` files. Both are already in `.gitignore`.

**`backend/.env`** (copy from `backend/.env.example`)

| Variable            | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `SUPABASE_URL`      | Project URL, e.g. `https://abcd1234.supabase.co`                  |
| `SUPABASE_ANON_KEY` | anon / publishable key (**not** the service_role / secret key)    |
| `CORS_ORIGINS`      | Comma-separated frontend origins, default `http://localhost:5173` |
| `APP_ENV`           | `development`                                                     |

**`frontend/.env`** (copy from `frontend/.env.example`)

| Variable                 | Description                                  |
| ------------------------ | -------------------------------------------- |
| `VITE_SUPABASE_URL`      | Same Project URL                             |
| `VITE_SUPABASE_ANON_KEY` | Same anon / publishable key                  |
| `VITE_API_URL`           | Backend URL, default `http://localhost:8000` |

## 3. Run locally

Requirements: **Node 20+** and **Python 3.11+**.

### Backend (terminal 1)

```powershell
cd backend
py -m venv .venv                      # macOS/Linux: python3 -m venv .venv
.\.venv\Scripts\Activate.ps1          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env                # then fill in the values
uvicorn app.main:app --reload --port 8000
```

Check it: <http://localhost:8000/api/health> should return `{"status":"ok","supabase_configured":true}`. Interactive API docs are at <http://localhost:8000/docs>.

### Frontend (terminal 2)

```powershell
cd frontend
npm install
copy .env.example .env                # then fill in the values
npm run dev
```

Open <http://localhost:5173>.

## 4. Testing the Sprint 1 flows

| Flow                  | Steps                                                                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Protected route**   | Open `http://localhost:5173/dashboard` while signed out. You should be redirected to `/login`.                                                                                                       |
| **Signup**            | Go to `/signup` and enter a name, email, and a password of at least 8 characters. With email confirmation on, you'll see a "Confirm your email" screen; click the link in the email. With it off, you land on the dashboard. |
| **Signup errors**     | Submit empty fields, an invalid email, or a short password to see field errors. Sign up again with the same email to see "account already exists".                                                    |
| **Login**             | Go to `/login` and sign in. A wrong password shows "Incorrect email or password"; an unconfirmed account shows a message asking you to confirm your email.                                            |
| **Persistent session**| Refresh the page or close and reopen the tab. You stay signed in.                                                                                                                                   |
| **Profile**           | Go to **Settings**, edit Full name, Email, Headline, and Bio, then click **Save changes**. Refresh to confirm the changes were saved. The sidebar name updates, and the "Complete your profile" step on Overview is checked once name, headline, and bio are all filled in. |
| **Logout**            | Click the sign-out icon in the sidebar footer, or **Settings → Sign out**. You go back to `/login`, and `/dashboard` is blocked again.                                                                |
| **RLS**               | In Supabase → Table Editor → `profiles`, each user has exactly one row. The API can only ever return the caller's own row.                                                                           |

## 5. API

| Method  | Path              | Auth   | Description                                                                         |
| ------- | ----------------- | ------ | ----------------------------------------------------------------------------------- |
| `GET`   | `/api/health`     | –      | Liveness and whether Supabase is configured                                         |
| `GET`   | `/api/profile/me` | Bearer | Returns the caller's profile, creating it if missing                                |
| `PATCH` | `/api/profile/me` | Bearer | Partial update of `full_name`, `email`, `headline`, `bio` (validated, unknown fields rejected) |

## 6. Key files

### Backend

- `app/main.py`: app factory, CORS, shared `httpx` client, and the Supabase error → JSON handler.
- `app/config.py`: reads settings from environment variables / `backend/.env`.
- `app/dependencies.py`: `get_current_user` reads the Bearer token and checks it with Supabase Auth.
- `app/services/supabase_client.py`: small async client for Supabase Auth and PostgREST that maps upstream errors to clean HTTP errors.
- `app/services/profile_service.py`: profile read, create (fallback), and update.
- `app/schemas/profile.py`: Pydantic models; length limits match the DB constraints.
- `app/routers/`: `health.py` and `profile.py` endpoints.
- `database/schema.sql`: table, RLS policies, and triggers.

### Frontend

- `src/lib/supabase.js`: Supabase client with a persistent, auto-refreshing session.
- `src/lib/apiClient.js`: `fetch` wrapper that attaches the access token and turns API errors into readable messages.
- `src/context/AuthProvider.jsx`: session state plus `signUp`, `signIn`, `signOut`.
- `src/context/ProfileProvider.jsx`: loads and saves the profile through the backend.
- `src/components/routing/`: `ProtectedRoute` (redirects to login) and `PublicOnlyRoute`.
- `src/config/navigation.js`: sidebar items; items with `available: false` render "Coming soon".
- `src/pages/`: auth pages, Overview, Settings, Coming soon, 404, and the missing-config screen.
- `src/styles/`: design tokens (`base.css`), components, layout, auth, and dashboard styles.

## Out of scope for Sprint 1

Projects, resumes, skills, timeline, evidence, OAuth, AI features, GitHub integration, resume parsing, certificates, and graphs. The sidebar shows these sections as **Coming soon**.
sdssss