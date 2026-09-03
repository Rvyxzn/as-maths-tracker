# Turning on cloud sync

Ten minutes, free tier, no card. When this is done your ratings, plan, past
papers and school tests follow you between your PC, laptop and phone, and the
export/import dance goes away.

Until you finish step 5 the tracker falls back to device-only profiles and says
so on the login screen. Nothing breaks in the meantime.

---

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) and sign in with GitHub.
2. **New project**. Name it anything (`revision-tracker` is fine).
3. Set a database password and save it in your password manager. You will not
   need it for this app, but you will need it if you ever open the database
   directly, and it cannot be recovered later.
4. Pick the region closest to you (London for the UK).
5. Wait a minute or two for it to finish provisioning.

## 2. Create the table

Open **SQL Editor** in the sidebar, paste this in, and press Run.

```sql
-- One row per user. The whole tracker document lives in `state`.
create table if not exists public.tracker_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  device     text,
  updated_at timestamptz not null default now()
);

-- Row level security is what stops one signed-in user reading another's
-- progress. Without it the anon key would expose every row, so this is not
-- optional.
alter table public.tracker_state enable row level security;

create policy "read own state"   on public.tracker_state
  for select using (auth.uid() = user_id);

create policy "insert own state" on public.tracker_state
  for insert with check (auth.uid() = user_id);

create policy "update own state" on public.tracker_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own state" on public.tracker_state
  for delete using (auth.uid() = user_id);
```

You should see "Success. No rows returned".

**Check the policies actually applied.** Go to **Table Editor → tracker_state**
and confirm it says *RLS enabled*. If it does not, the anon key in your public
config would let anyone read everyone's data.

## 3. Set the redirect URLs

**Authentication → URL Configuration**:

- **Site URL**: `https://rvyxzn.github.io/as-maths-tracker/`
- **Redirect URLs**: add both
  - `https://rvyxzn.github.io/as-maths-tracker/`
  - `http://localhost:8080/`

Without these, signing in bounces you to a blank page.

## 4. Google sign-in (optional)

Email and password works without this.

1. **Authentication → Providers → Google**, toggle it on.
2. It shows you a **callback URL** ending in `/auth/v1/callback`. Copy it.
3. At [console.cloud.google.com](https://console.cloud.google.com/), create an
   OAuth client ID (Web application) as described in `js/auth-config.js`, and
   paste that callback URL into **Authorised redirect URIs**.
4. Put the Google **Client ID** and **Client secret** into Supabase and save.

The secret goes into Supabase, never into this repository. Supabase holds it
server-side, which is exactly the step a static site cannot do for itself.

## 5. Paste your keys in

**Project Settings → API**. Copy:

- **Project URL**
- **anon / public** key

Put them into `js/auth-config.js`:

```js
SUPABASE_URL: "https://xxxxxxxxxxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJhbGciOi..."
```

Commit and push. The login screen switches to email and password on its own.

> The anon key is designed to be public and is safe in this file. The
> **service_role** key on the same page is not: it bypasses row level security
> entirely. Never put it in this repository or anywhere else in the browser.

## 6. Turn off email confirmation while testing (optional)

By default Supabase emails a confirmation link before a new account can sign
in. To skip that while you are setting up: **Authentication → Providers →
Email**, turn off *Confirm email*. Turn it back on before anyone else uses it.

---

## How the syncing behaves

- **Saves are local first.** Every change writes to this browser immediately,
  then pushes to Supabase a few seconds later. A slow or missing network can
  never lose a save that already succeeded on the device.
- **Offline works.** Keep revising on a train; it syncs when you reconnect. The
  sidebar chip says `Offline, saved here` while that is the case.
- **Signing in on a new device** pulls your account's copy down.
- **Conflicts are not resolved silently.** If this device and your account both
  have work and they are not the same save, the app shows you what is in each
  copy and asks. The copy you do not keep is downloaded as a JSON file first,
  so a wrong click is recoverable.
- **Last write wins per document.** Editing on two devices while one is offline
  replaces rather than merges. For one person across three devices this is
  fine; it would not be for several people editing at once.

## If something goes wrong

| What you see | Usually means |
|---|---|
| `The tracker_state table is missing` | Step 2 was not run, or was run on a different project |
| Sign-in returns to a blank page | Redirect URLs in step 3 do not match your address exactly, trailing slash included |
| `Email not confirmed` | Click the link in the signup email, or turn confirmation off (step 6) |
| Chip stuck on `Sync failed` | Click it to retry; hover it for the actual error |
| Signed in but no data | RLS policies missing or wrong, so your own row is invisible to you. Re-run step 2 |
