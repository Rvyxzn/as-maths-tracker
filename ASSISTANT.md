# Turning the assistant on

The app already works without this. The timetable's "Describe your week" box
falls back to phrase matching, and says so when it does. This replaces that
with a real model, which is the difference between reading *"only do economics
on Friday"* and reading *"focus on economics until Friday"*.

It takes about ten minutes and three commands. You have to run them
yourself: two of the three involve credentials, and I am not going to type
your API key or click through your sign-in for you.

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

Already done on this machine — it is version 2.117.0. On a new machine:

```bash
npm install -g supabase
```

## 2. Sign in

```bash
supabase login
```

That opens a browser and asks you to authorise. It is the only step that
needs a browser.

**There is no `link` step.** Both commands below take `--project-ref`, so
the project is named where it is used. Linking would ask for the database
password, which is a thing to lose for no benefit.

## 3. Give it the API key

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here --project-ref hgbyenbvsdlnixmtzmwx
```

This stores it on Supabase, not in the repo. Never paste this key into any
file in this folder — everything here is public. It does land in your shell
history; if that bothers you, put it in a `.env` file **outside this folder**
and use `--env-file ../secrets.env` instead.

## 4. Deploy the function

```bash
supabase functions deploy assistant --project-ref hgbyenbvsdlnixmtzmwx --use-api
```

`--use-api` bundles it on Supabase's side, so Docker does not have to be
running locally.

That is it. Reload the app, sign in, go to **Timetable → Describe your week**,
type something and press **Read it**. The result now carries a green
**assistant** tag instead of the grey "phrase matching" one.

---

## Checking it works

```bash
supabase functions logs assistant --project-ref hgbyenbvsdlnixmtzmwx
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
supabase secrets set ALLOWED_ORIGINS="https://rvyxzn.github.io,http://localhost:8080,http://localhost:5500" --project-ref hgbyenbvsdlnixmtzmwx
supabase functions deploy assistant --project-ref hgbyenbvsdlnixmtzmwx --use-api
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
