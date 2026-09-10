/* ============================================================
   The assistant, server side

   This exists for one reason: the API key. The app is a static
   site on GitHub Pages, so anything it ships is readable by
   anyone who opens the network tab, and a key in there is a key
   anybody can spend. So the browser calls this, and this calls
   the model. The key is set with `supabase secrets set` and never
   leaves the server.

   WHO CAN CALL IT. Signed-in users of this project only. The
   browser sends its Supabase session token, this verifies it
   against the project, and an unverified request is refused
   before any tokens are spent. Without that check the function is
   an open proxy to a paid API with your name on the bill.

   WHAT IT WILL NOT DO. It does not apply anything. It returns
   settings as data, the browser validates them against a
   whitelist, and the person reads them and presses Apply. A model
   is a good reader and a bad thing to hand write access to.

   Deploying it is four commands, in ASSISTANT.md.
   ============================================================ */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const MODEL = "claude-sonnet-5";
const ANTHROPIC = "https://api.anthropic.com/v1/messages";

/* Where the browser is allowed to call from. A wildcard would let any site
   spend this project's credits using a token phished from elsewhere. */
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ||
  "https://rvyxzn.github.io,http://localhost:8080,http://localhost:8777")
  .split(",").map((s) => s.trim());

function cors(origin: string | null) {
  const ok = origin && ALLOWED.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin! : ALLOWED[0],
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

/* A day of somebody's week, in the shape the app already applies. The model
   is told to return exactly this and nothing else. */
const SCHEMA = `{
  "said":   [string],        // one plain sentence per setting you understood
  "missed": [string],        // anything you could not turn into a setting
  "rules": {
    "dailyCapMins":     number|null,      // most revision on any one day
    "dayCaps":          { "0".."6": number },   // 0 = Sunday
    "subjectsPerDay":   number,           // 0 = no limit
    "subjectDays":      { subjectId: [0..6] },  // days that subject may take
    "subjectMins":      { subjectId: number },  // minutes a WEEK
    "paperRamp":        boolean,          // more past papers as an exam nears
    "examQuestions":    boolean,
    "examQuestionEvery": number,          // one every N blocks
    "alternate":        { subjectId: true },    // swap halves of a split spec
    "blockMins":        number,
    "breakMins":        number,
    "focus": [ { "id": subjectId, "until": "YYYY-MM-DD"|null, "days": [0..6] } ]
  },
  "windows": { "0".."6": { "from": "HH:MM", "to": "HH:MM", "off": boolean } },
  "flex":    [ { "label": string, "mins": number, "days": [0..6],
                 "either": boolean, "prefer": "start"|"end"|"at", "at": "HH:MM"|null } ],
  "busy":    [ { "label": string, "days": [0..6], "from": "HH:MM", "to": "HH:MM" } ]
}`;

const RULES = `You turn a student's description of their week into timetable settings.

Return ONLY a JSON object of this shape. No prose, no markdown fence:
${SCHEMA}

How to read them:
- "until Friday", "by Friday", "before Friday" is a DEADLINE, not a day to work on.
  Put it in focus[].until as a date. Never in subjectDays.
- "focus on X", "heavy X", "mostly X" asks for MORE of X. Use focus[]. It is not
  a restriction and must never narrow subjectDays.
- "only X on Mondays", "no X on Sundays" ARE restrictions. Those are subjectDays.
- "Saturday or Sunday" means one session on either, so flex[].either is true.
  "Saturday and Sunday" means one on each.
- A duration attached to a named activity ("45 minutes of UCAS") is flex[], not a cap.
- Omit every key you have no evidence for. Do not invent a value to fill the shape.

"said" must contain one short sentence per setting, in plain English, in the second
person, so the student can check it before applying. Put anything you could not act
on into "missed", quoting their own words. Never leave a request out of both lists.`;

/* ---------------- task two: write the answer ----------------

   The mark scheme is not an answer. It is a list of everything an
   examiner may credit, written so it covers whatever a candidate puts
   down, and reading it teaches the shape of a checklist rather than the
   shape of an essay. This writes the essay.

   TWO ANALYTICAL PARAGRAPHS, ALWAYS. A 25-marker is not a 12-marker with
   a third argument bolted on, it is two arguments taken further. The
   examiner reports say so in almost every series, and the commonest way
   to lose an A is running out of time before the evaluation because a
   third chain ate it. */
const ANSWER_SHAPE = `{
  "define":     string|null,   // the opening sentence, defining what the question turns on
  "diagram":    string|null,   // what to draw and label, only if the scheme credits one
  "paragraphs": [              // EXACTLY two KAA, each followed by its own EV
    { "role": "kaa", "n": 1, "text": string },
    { "role": "ev",  "n": 1, "text": string },
    { "role": "kaa", "n": 2, "text": string },
    { "role": "ev",  "n": 2, "text": string }
  ],
  "judgement":  string|null    // only where the tariff carries evaluation marks
}`;

const ANSWER_RULES = `You are an experienced Edexcel A level Economics A (9EC0) examiner writing
the answer you would award full marks to. Write it out in full, as a candidate would in
the exam. Not a plan, not bullet points, not advice - the actual prose.

Return ONLY a JSON object of this shape. No prose outside it, no markdown fence:
${ANSWER_SHAPE}

How to write it:
- EXACTLY two "kaa" paragraphs. Never three, whatever the tariff. More marks mean each
  chain runs further, not that there are more of them.
- A kaa paragraph is one chain of reasoning, each link caused by the last: state the
  point, say why it happens, then "which means...", then "and therefore...", landing on
  exactly what the question asked about. At 25 marks take each chain four or five links;
  at 8 marks, three.
- Each "ev" paragraph evaluates the kaa paragraph it follows, and nothing else. Weigh
  that specific argument: how large the effect is, how likely, how long it lasts, what
  it depends on, who it falls on. Never a generic list of evaluation words.
- Use the indicative content from the mark scheme as the substance - those are the points
  Pearson credits. Use the examiner report where it says what full-mark answers did.
- Where an extract or figure is given, quote a number or a phrase from it. Applied marks
  are lost by writing in the abstract.
- Use the technical vocabulary the specification uses, and define terms on first use.
- "judgement" must actually decide, and say what would change the decision. Never
  "it depends" with nothing after it.
- Write in continuous prose. No headings inside a paragraph, no bullet points.

Length: aim for about ${"${words}"} words in total, which is what a candidate writes in the
time the tariff allows. Do not pad to reach it.`;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "POST only" }, 405, origin);

  /* ---- who is asking ---- */
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sign in to use the assistant." }, 401, origin);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: who, error: whoErr } = await supabase.auth.getUser(token);
  if (whoErr || !who?.user) {
    return json({ error: "That sign-in is not valid any more. Sign in again." }, 401, origin);
  }

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "The assistant is not configured on the server." }, 503, origin);

  /* ---- what they asked ---- */
  let body: {
    task?: string;
    text?: string; subjects?: Array<{ id: string; name: string }>; today?: string;
    question?: string; scheme?: string; report?: string; context?: string; marks?: number;
  };
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400, origin); }

  const task = body.task === "answer" ? "answer" : "timetable";

  /* Two jobs, one function. It is the same key, the same sign-in check and
     the same allowed-origins list; a second Edge Function would repeat all
     three and be a second thing to deploy. Only the instructions and what
     gets sent differ. */
  let system: string;
  let userContent: string;
  let maxTokens: number;

  if (task === "answer") {
    const question = String(body.question || "").slice(0, 6000);
    if (!question.trim()) return json({ error: "No question to answer" }, 400, origin);
    const marks = Math.max(1, Math.min(25, Number(body.marks) || 25));
    /* Roughly what a candidate writes in the time the tariff allows. */
    const words = marks * 25;
    system = ANSWER_RULES.replace("${words}", String(words));
    maxTokens = 4000;
    userContent =
      `The question, worth ${marks} marks:\n${question}\n\n` +
      (body.context ? `The extracts and figures it refers to:\n${String(body.context).slice(0, 12000)}\n\n` : "") +
      (body.scheme ? `Pearson's mark scheme, indicative content:\n${String(body.scheme).slice(0, 8000)}\n\n` : "") +
      (body.report ? `Pearson's examiner report on this question:\n${String(body.report).slice(0, 6000)}\n` : "");
  } else {
    const text = String(body.text || "").slice(0, 4000);
    if (!text.trim()) return json({ error: "Nothing to read" }, 400, origin);
    const subjects = (body.subjects || []).slice(0, 12)
      .map((s) => `${s.id} = ${s.name}`).join("\n");
    const today = /^\d{4}-\d{2}-\d{2}$/.test(String(body.today)) ? body.today : null;
    system = RULES;
    maxTokens = 1600;
    userContent =
      `Their subjects, as id = name:\n${subjects || "(none set up yet)"}\n\n` +
      (today ? `Today is ${today}. Weekday 0 is Sunday.\n\n` : "") +
      `What they wrote:\n${text}`;
  }

  const res = await fetch(ANTHROPIC, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("model error", res.status, detail.slice(0, 400));
    return json({
      error: res.status === 429
        ? "The assistant is busy. Try again in a moment."
        : "The assistant could not be reached.",
    }, 502, origin);
  }

  const out = await res.json();
  const said = (out.content || []).filter((c: { type: string }) => c.type === "text")
    .map((c: { text: string }) => c.text).join("");

  /* The model was asked for bare JSON; a fence is the usual way that goes
     wrong, so it is stripped rather than treated as a failure. */
  const cleaned = said.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  let parsed: unknown;
  try { parsed = JSON.parse(cleaned); }
  catch {
    console.error("unparseable model reply", cleaned.slice(0, 400));
    return json({ error: "The assistant replied in a shape this app could not read." }, 502, origin);
  }

  return json({ ok: true, result: parsed }, 200, origin);
});
