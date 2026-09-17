/* ============================================================
   The to-do list — things you have starred to come back to.

   It started life inside the Economics question packs as a list of
   question ids. Chapters belong on the same list: "come back to
   binomial expansion" is the same kind of note to self as "come back
   to this 12 marker", and keeping two lists means neither gets read.
   So the list holds typed entries and every view stars into the same
   one. It lives in Store state, so it is per subject and rides the
   cloud sync with everything else.
   ============================================================ */

const Todo = (function () {

  const KINDS = { chapter: 1, section: 1, question: 1 };

  function all() {
    const st = Store.get();
    if (!st.todo) st.todo = [];
    return st.todo;
  }

  function idx(kind, id) {
    const list = all();
    for (let i = 0; i < list.length; i++) {
      if (list[i].kind === kind && list[i].id === id) return i;
    }
    return -1;
  }

  function has(kind, id) { return idx(kind, id) >= 0; }

  /* Newest first is the wrong order here: you star three chapters in a row
     and want to work down them in the order you thought of them. */
  function ofKind(kind) {
    return all().filter(function (e) { return e.kind === kind; });
  }

  function idsOfKind(kind) {
    return ofKind(kind).map(function (e) { return e.id; });
  }

  function add(kind, id) {
    if (!KINDS[kind] || !id) return false;
    if (has(kind, id)) return false;
    Store.mutate(function (st) {
      if (!st.todo) st.todo = [];
      st.todo.push({ kind: kind, id: id, at: new Date().toISOString() });
    });
    return true;
  }

  function remove(kind, id) {
    const i = idx(kind, id);
    if (i < 0) return false;
    Store.mutate(function (st) { st.todo.splice(i, 1); });
    return true;
  }

  function toggle(kind, id) {
    if (has(kind, id)) { remove(kind, id); return false; }
    add(kind, id);
    return true;
  }

  function clear(kind) {
    Store.mutate(function (st) {
      st.todo = (st.todo || []).filter(function (e) { return kind ? e.kind !== kind : false; });
    });
  }

  function count(kind) { return kind ? ofKind(kind).length : all().length; }

  /* ---------- what an entry actually points at ----------
     A save can outlive the thing it names: a custom topic gets deleted, or
     a subject switch leaves an id that means nothing here. Resolving
     returns null for those and the views drop them rather than rendering
     a blank row. */
  function resolve(e) {
    if (e.kind === "question") {
      const q = (typeof ECO_QUESTIONS !== "undefined")
        ? ECO_QUESTIONS.filter(function (x) { return x.id === e.id; })[0] : null;
      if (!q) return null;
      return { kind: "question", id: e.id, at: e.at, ref: q,
               code: q.marks + " marks",
               name: (q.topicName || q.section || "Question"),
               sub: "Paper " + q.paper + " \u00b7 " + (q.series || "") };
    }
    const inf = Store.info(e.id);
    if (!inf || !inf.sub) return null;
    const eff = Metrics.effectiveRag(e.id);
    return { kind: e.kind, id: e.id, at: e.at, ref: inf,
             code: inf.sub.code, name: inf.sub.name,
             rag: eff && eff.rag,
             sub: e.kind === "chapter"
               ? (inf.sub.sectionIds ? inf.sub.sectionIds.length + " sections" : "chapter")
               : (inf.chapter ? inf.chapter.name : "") };
  }

  function entries(kind) {
    return (kind ? ofKind(kind) : all()).map(resolve).filter(Boolean);
  }

  /* ---------- the star ----------
     One button, used from chapter cards, section rows and question cards,
     so that starring means the same thing everywhere it appears. */
  function star(kind, id, opts) {
    opts = opts || {};
    const on = has(kind, id);
    return '<button class="todo-star' + (on ? " on" : "") + (opts.compact ? " compact" : "") + '" ' +
      'data-action="todo-toggle" data-kind="' + kind + '" data-id="' + UI.esc(id) + '" ' +
      'title="' + (on ? "On your to-do list \u2014 click to take it off"
                      : "Add this to your to-do list") + '" ' +
      'aria-pressed="' + (on ? "true" : "false") + '" ' +
      'aria-label="' + (on ? "Remove from to-do list" : "Add to to-do list") + '">' +
      (on ? "\u2605" : "\u2606") +
      (opts.label ? '<span>' + (on ? "On your list" : "To-do") + '</span>' : "") +
    '</button>';
  }

  /* ---------- migration ----------
     packTodo was a bare array of Economics question ids. Anything on it
     moves across once, and the old key is left alone so a save opened in
     an older build still finds its list. */
  function migrate(st) {
    if (!st.todo) st.todo = [];
    if (st.todoMigrated) return;
    (st.packTodo || []).forEach(function (id) {
      if (!st.todo.some(function (e) { return e.kind === "question" && e.id === id; })) {
        st.todo.push({ kind: "question", id: id, at: new Date().toISOString() });
      }
    });
    st.todoMigrated = true;
  }

  return { has: has, add: add, remove: remove, toggle: toggle, clear: clear,
           count: count, entries: entries, idsOfKind: idsOfKind, star: star,
           migrate: migrate };
})();
