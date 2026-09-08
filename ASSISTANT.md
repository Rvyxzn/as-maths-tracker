# Turning the assistant on

The app already works without this. The timetable's "Describe your week" box
falls back to phrase matching, and says so when it does. This replaces that
with a real model, which is the difference between reading *"only do economics
on Friday"* and reading *"focus on economics until Friday"*.

It takes about ten minutes and four commands.

---

## Why it needs a server at all

The app is a static site on GitHub Pages. Everything it ships, the browser can
read — including anything in `auth-config.js`. An API key put there is a key
anyone can find and spend, billed to you.

So the key lives in a **Supabase Edge Function**. The browser sends its
sign-in token and the sentence; the function checks the token is real, calls
the model, and sends back settings. The key never leaves Supabase.

That check matters. Without it the function is an open proxy to a paid API
with your name on the bill.

---

## What you need

- The Supabase project you already have (`hgbyenbvsdlnixmtzmwx`).
- An Anthropic API key — <https://console.anthropic.com> → **API keys**.
  Put a spending limit on it while you are trying this out.
- Node installed (you have it).

---

## 1. Install the Supabase CLI

```bash
npm install -g supabase
```

Check it worked:

```bash
supabase --version
```

## 2. Sign in and link the project

```bash
supabase login
```

That opens a browser and asks you to authorise. Then, from the
`Revision Tracker` folder:

```bash
supabase link --project-ref hgbyenbvsdlnixmtzmwx
```

It will ask for your **database password** — the one you set when you created
the project. If you have lost it: Supabase dashboard → **Settings** →
**Database** → **Reset database password**. Resetting it does not affect
anything the app currently does.

## 3. Give it the API key

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

This stores it on Supabase, not in the repo. Never paste this key into any
file in this folder — everything here is public.

## 4. Deploy the function

```bash
supabase functions deploy assistant
```

That is it. Reload the app, sign in, go to **Timetable → Describe your week**,
type something and press **Read it**. The result now carries a green
**assistant** tag instead of the grey "phrase matching" one.

---

## Checking it works

```bash
supabase functions logs assistant
```

Every call appears there. If something is wrong, the app will have already
told you which of these it was:

| What the app says | What it means |
|---|---|
| grey tag, "not signed in" | The assistant only runs for signed-in users. Sign in. |
| grey tag, "no assistant is set up" | `ASSISTANT` is `false` in `auth-config.js`, or `SUPABASE_URL` is blank. |
| "The assistant is not configured on the server" | The function is deployed but `ANTHROPIC_API_KEY` is not set. Step 3. |
| "Could not reach the assistant" | The function is not deployed, or the browser was blocked by CORS. See below. |
| "That sign-in is not valid any more" | The session expired. Sign out and back in. |

### If you are testing on a different address

The function only answers requests from addresses it knows, so a token taken
from somewhere else cannot spend your credits. The defaults are the GitHub
Pages site and `localhost:8080` / `localhost:8777`. To add another:

```bash
supabase secrets set ALLOWED_ORIGINS="https://rvyxzn.github.io,http://localhost:8080,http://localhost:5500"
supabase functions deploy assistant
```

---

## What it costs

One "Read it" is a small request — roughly a page of instructions plus your
sentence, and a short JSON reply back. On Sonnet that is a fraction of a penny.
The expensive things are the ones that read whole documents, which is worth
remembering when the same function later marks essays.

Anthropic's console has a hard spending limit. Set one.

---

## What it does not do

The function **returns** settings. It never applies them.

Everything it sends back is checked in the browser against the same whitelist
the phrase matcher produces — a day has to be 0 to 6, a cap has to be a real
number of minutes, a subject id has to be one of yours — and anything that
fails is dropped rather than coerced. Then you read the summary and press
Apply, exactly as before.

A model is a good reader and a bad thing to hand write access to.

---

## Turning it off

In `js/auth-config.js`:

```js
ASSISTANT: false
```

The app goes back to phrase matching and carries on. To stop it entirely,
`supabase functions delete assistant`.
