"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mark, useAuth } from "./AuthGate";
import {
  categoryName,
  displayUrl,
  GENERAL_CATEGORY,
  initials,
  isExternal,
  launchItems,
  Project,
  projectFor,
  projects,
} from "@/lib/sites";

type Task = { id: string; categoryId: string; text: string; completed: boolean; position: number };
type Row = { id: string; category_id: string; text: string; completed: boolean | null; position: number | null };

const COLUMNS = "id, category_id, text, completed, position";
const SHOW_DONE_KEY = "jlg-core-show-completed";
const GENERAL_ACCENT = "#7a827d";

const toTask = (r: Row): Task => ({
  id: r.id,
  categoryId: r.category_id,
  text: r.text,
  completed: r.completed ?? false,
  position: r.position ?? 0,
});

const tint = (hex: string, pct: number) => `color-mix(in srgb, ${hex} ${pct}%, transparent)`;
const accentOf = (categoryId: string) => projectFor(categoryId)?.accent ?? GENERAL_ACCENT;

function linkProps(url: string) {
  return isExternal(url) ? { href: url, target: "_blank", rel: "noopener noreferrer" } : { href: url };
}

function greeting(d: Date) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* ---------------------------------------------------------------- icons */

const Icon = {
  search: <path d="m21 21-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />,
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: <path d="m3 3 18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.7 3.6M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  out: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

function Svg({ icon, className = "h-4 w-4" }: { icon: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {icon}
    </svg>
  );
}

function Monogram({ name, accent, size = "md" }: { name: string; accent: string; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center font-semibold tracking-tight ${
        size === "sm" ? "h-8 w-8 rounded-lg text-[11px]" : "h-10 w-10 rounded-xl text-xs"
      }`}
      style={{ background: tint(accent, 16), color: accent, boxShadow: `inset 0 0 0 1px ${tint(accent, 22)}` }}
    >
      {initials(name)}
    </span>
  );
}

/* ---------------------------------------------------------------- page */

export default function Home() {
  const { userId, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [now] = useState(() => new Date());
  const searchRef = useRef<HTMLInputElement>(null);
  // Safe to read storage here: this page only mounts client-side, after AuthGate confirms a session.
  const [showDone, setShowDone] = useState(() => {
    try {
      return window.localStorage.getItem(SHOW_DONE_KEY) === "1";
    } catch {
      return false;
    }
  });

  function toggleShowDone() {
    const next = !showDone;
    setShowDone(next);
    try {
      window.localStorage.setItem(SHOW_DONE_KEY, next ? "1" : "0");
    } catch {}
  }

  useEffect(() => {
    let active = true;
    supabase
      .from("jlg_core_tasks")
      .select(COLUMNS)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError("JLG Core could not load your saved tasks.");
        else setTasks((data ?? []).map(toTask));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // "/" or ⌘K focuses search, Esc clears it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const addTask = useCallback(
    async (categoryId: string, text: string) => {
      setError("");
      const position = tasks.reduce((m, t) => Math.max(m, t.position), -1) + 1;
      const { data, error } = await supabase
        .from("jlg_core_tasks")
        .insert({ user_id: userId, category_id: categoryId, text, completed: false, position })
        .select(COLUMNS)
        .single();
      if (error || !data) {
        setError("JLG Core could not save that task.");
        return false;
      }
      setTasks((c) => [...c, toTask(data)]);
      return true;
    },
    [tasks, userId],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const t = tasks.find((x) => x.id === id);
      if (!t) return;
      setTasks((c) => c.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)));
      const { error } = await supabase.from("jlg_core_tasks").update({ completed: !t.completed }).eq("id", id);
      if (error) {
        setTasks((c) => c.map((x) => (x.id === id ? t : x)));
        setError("JLG Core could not update that task.");
      }
    },
    [tasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const prev = tasks;
      setTasks((c) => c.filter((t) => t.id !== id));
      const { error } = await supabase.from("jlg_core_tasks").delete().eq("id", id);
      if (error) {
        setTasks(prev);
        setError("JLG Core could not delete that task.");
      }
    },
    [tasks],
  );

  async function clearCompleted() {
    const ids = tasks.filter((t) => t.completed).map((t) => t.id);
    if (!ids.length || !window.confirm(`Delete ${ids.length} completed task${ids.length === 1 ? "" : "s"}?`)) return;
    const { error } = await supabase.from("jlg_core_tasks").delete().in("id", ids);
    if (error) {
      setError("JLG Core could not clear completed tasks.");
      return;
    }
    setTasks((c) => c.filter((t) => !t.completed));
  }

  const q = query.trim().toLowerCase();
  const matches = (...fields: string[]) => !q || fields.some((f) => f.toLowerCase().includes(q));

  const openCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.length - openCount;
  const activeProjects = new Set(tasks.filter((t) => !t.completed).map((t) => t.categoryId)).size;
  const busiest = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.filter((t) => !t.completed).forEach((t) => counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? { name: categoryName(top[0]), count: top[1] } : null;
  }, [tasks]);

  const visibleLaunch = launchItems.filter((l) => matches(l.name, l.sub, l.url, l.group));
  const visibleProjects = projects.filter(
    (p) => matches(p.name, p.label, p.url ?? "") || tasks.some((t) => t.categoryId === p.id && matches(t.text)),
  );
  const projectTaskMatch = (p: Project) => matches(p.name, p.label, p.url ?? "");

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Mark size={32} />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">JLG Core</span>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <Svg icon={Icon.search} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setQuery("");
                  e.currentTarget.blur();
                }
                if (e.key === "Enter" && q && visibleLaunch[0]) window.open(visibleLaunch[0].url, isExternal(visibleLaunch[0].url) ? "_blank" : "_self", "noopener,noreferrer");
              }}
              placeholder="Search sites and tasks…"
              aria-label="Search sites and tasks"
              className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-14 text-sm outline-none transition placeholder:text-faint focus:border-line-strong focus:bg-raised"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
              ⌘K
            </kbd>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleShowDone}
              aria-pressed={showDone}
              title={showDone ? "Hide completed tasks" : "Show completed tasks"}
              className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs text-muted transition hover:bg-surface hover:text-ink"
            >
              <Svg icon={showDone ? Icon.eye : Icon.eyeOff} />
              <span className="hidden md:inline">{showDone ? "Showing done" : "Hiding done"}</span>
            </button>
            <button
              onClick={signOut}
              title="Sign out"
              className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs text-muted transition hover:bg-surface hover:text-ink"
            >
              <Svg icon={Icon.out} />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-12 px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
        {/* hero */}
        <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-faint">
              {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              {greeting(now)}.
              <br />
              <span className="italic text-muted">Here&rsquo;s everything.</span>
            </h1>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[620px]">
            <Stat label="Open tasks" value={loading ? "–" : openCount} />
            <Stat label="Completed" value={loading ? "–" : doneCount} />
            <Stat label="Active projects" value={loading ? "–" : activeProjects} hint={busiest ? `Busiest: ${busiest.name}` : undefined} />
            <Stat label="Sites linked" value={launchItems.length} />
          </dl>
        </section>

        {error && (
          <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss" className="rounded-md p-1 hover:bg-danger/10">
              <Svg icon={Icon.x} />
            </button>
          </div>
        )}

        {/* launchpad */}
        <Section title="Launchpad" count={visibleLaunch.length} hint={q ? "Press Enter to open the first match" : "Every site, one click away"}>
          {visibleLaunch.length ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3 2xl:grid-cols-4">
              {visibleLaunch.map((l) => (
                <a
                  key={l.key}
                  {...linkProps(l.url)}
                  className="group flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5 transition sm:gap-3 sm:p-3 sm:pr-4 hover:-translate-y-0.5 hover:border-line-strong hover:bg-raised hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
                >
                  <span className="sm:hidden"><Monogram name={l.name} accent={l.accent} size="sm" /></span>
                  <span className="hidden sm:inline-flex"><Monogram name={l.name} accent={l.accent} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium sm:text-sm">{l.name}</p>
                    <p className="truncate text-[11px] text-faint sm:text-xs">{displayUrl(l.url)}</p>
                  </div>
                  <span className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-muted ring-1 ring-line md:inline">{l.group}</span>
                  <Svg icon={Icon.arrow} className="hidden h-4 w-4 shrink-0 text-faint transition sm:block group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                </a>
              ))}
            </div>
          ) : (
            <Empty>No sites match &ldquo;{query}&rdquo;.</Empty>
          )}
        </Section>

        {/* projects + all tasks */}
        <div className="grid grid-cols-1 items-start gap-12 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8 [&>*]:min-w-0">
          <Section title="Projects" count={visibleProjects.length} hint="Checklists for each business">
            {loading ? (
              <Skeleton />
            ) : visibleProjects.length ? (
              <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4">
                {visibleProjects.map((p) => {
                  const all = tasks.filter((t) => t.categoryId === p.id);
                  const shown = all.filter((t) => (showDone || !t.completed) && (projectTaskMatch(p) || matches(t.text)));
                  return (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      total={all.length}
                      done={all.filter((t) => t.completed).length}
                      tasks={shown}
                      onAdd={(text) => addTask(p.id, text)}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  );
                })}
              </div>
            ) : (
              <Empty>No projects match &ldquo;{query}&rdquo;.</Empty>
            )}
          </Section>

          <div className="xl:sticky xl:top-24">
            <AllTasks
              tasks={tasks}
              loading={loading}
              showDone={showDone}
              matches={matches}
              onAdd={addTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onClearCompleted={clearCompleted}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- pieces */

function Section({ title, count, hint, children }: { title: string; count?: number; hint?: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h2 className="font-display text-3xl tracking-tight">
          {title}
          {count !== undefined && <span className="ml-2 align-top font-sans text-xs font-medium text-faint">{count}</span>}
        </h2>
        {hint && <p className="text-right text-xs text-faint">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
      <dt className="text-[11px] font-medium text-muted">{label}</dt>
      <dd className="mt-1 font-display text-4xl leading-none tracking-tight">{value}</dd>
      {hint && <dd className="mt-1.5 truncate text-[10px] text-faint">{hint}</dd>}
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-faint">{children}</p>;
}

function Skeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-44 animate-pulse rounded-3xl border border-line bg-surface" />
      ))}
    </div>
  );
}

function Check({ task, onToggle, accent }: { task: Task; onToggle: (id: string) => void; accent: string }) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      aria-label={task.completed ? `Mark "${task.text}" as not done` : `Mark "${task.text}" as done`}
      aria-pressed={task.completed}
      className="mt-px inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition hover:scale-110"
      style={task.completed ? { background: accent, borderColor: accent, color: "#fff" } : { borderColor: tint(accent, 55) }}
    >
      {task.completed && <Svg icon={Icon.check} className="h-3 w-3" />}
    </button>
  );
}

function TaskRow({
  task,
  accent,
  onToggle,
  onDelete,
  meta,
}: {
  task: Task;
  accent: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  meta?: ReactNode;
}) {
  return (
    <li className="group flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-paper/70">
      <Check task={task} onToggle={onToggle} accent={accent} />
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] leading-5 ${task.completed ? "text-faint line-through" : ""}`}>{task.text}</p>
        {meta}
      </div>
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.text}"`}
        className="rounded-md p-0.5 text-faint opacity-0 transition hover:bg-danger/10 hover:text-danger focus:opacity-100 group-hover:opacity-100 max-sm:opacity-60"
      >
        <Svg icon={Icon.x} className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function AddTaskForm({ onAdd, placeholder, children }: { onAdd: (text: string) => Promise<boolean>; placeholder: string; children?: ReactNode }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    if (await onAdd(value)) setText("");
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-xl border border-line bg-raised p-1 pl-3 transition focus-within:border-line-strong">
      <Svg icon={Icon.plus} className="h-3.5 w-3.5 shrink-0 text-faint" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
      />
      {children}
      <button
        disabled={busy || !text.trim()}
        className="h-8 shrink-0 rounded-lg bg-brand px-3 text-xs font-medium text-brand-ink transition hover:opacity-90 disabled:opacity-30"
      >
        Add
      </button>
    </form>
  );
}

function ProjectCard({
  project,
  total,
  done,
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  project: Project;
  total: number;
  done: number;
  tasks: Task[];
  onAdd: (text: string) => Promise<boolean>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const open = total - done;
  return (
    <article className="break-inside-avoid overflow-hidden rounded-3xl border border-line bg-surface">
      <div className="h-1" style={{ background: project.accent }} />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Monogram name={project.name} accent={project.accent} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold tracking-tight">{project.name}</h3>
            <p className="truncate text-xs text-muted">{project.label}</p>
          </div>
          {project.url && (
            <a
              {...linkProps(project.url)}
              title={`Open ${displayUrl(project.url)}`}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 text-[11px] font-medium text-muted transition hover:border-line-strong hover:bg-raised hover:text-ink"
            >
              Open <Svg icon={Icon.arrow} className="h-3 w-3" />
            </a>
          )}
        </div>

        {(project.url || project.links) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.url && <span className="truncate rounded-md px-1.5 py-0.5 text-[11px] text-faint">{displayUrl(project.url)}</span>}
            {project.links?.map((l) => (
              <a
                key={l.url}
                {...linkProps(l.url)}
                className="rounded-md px-1.5 py-0.5 text-[11px] font-medium transition hover:brightness-90"
                style={{ background: tint(project.accent, 12), color: project.accent }}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: tint(project.accent, 14) }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: project.accent }} />
          </div>
          <span className="shrink-0 text-[11px] tabular-nums text-muted">
            {total ? `${open} open · ${done}/${total}` : "No tasks"}
          </span>
        </div>

        <ul className="-mx-2 mt-3">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} accent={project.accent} onToggle={onToggle} onDelete={onDelete} />
          ))}
          {total > 0 && !tasks.length && <li className="px-2 py-1.5 text-xs text-faint">All done here ✓</li>}
        </ul>

        <div className="mt-3">
          <AddTaskForm onAdd={onAdd} placeholder={`Add to ${project.name}`} />
        </div>
      </div>
    </article>
  );
}

function AllTasks({
  tasks,
  loading,
  showDone,
  matches,
  onAdd,
  onToggle,
  onDelete,
  onClearCompleted,
}: {
  tasks: Task[];
  loading: boolean;
  showDone: boolean;
  matches: (...f: string[]) => boolean;
  onAdd: (categoryId: string, text: string) => Promise<boolean>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [target, setTarget] = useState<string>(GENERAL_CATEGORY);

  const openBy = (id: string) => tasks.filter((t) => t.categoryId === id && !t.completed).length;
  const chips = [
    { id: "all", name: "All", count: tasks.filter((t) => !t.completed).length, accent: "" },
    { id: GENERAL_CATEGORY, name: "General", count: openBy(GENERAL_CATEGORY), accent: GENERAL_ACCENT },
    ...projects.map((p) => ({ id: p.id, name: p.name, count: openBy(p.id), accent: p.accent })).filter((c) => c.count > 0),
  ];
  const shown = tasks
    .filter((t) => filter === "all" || t.categoryId === filter)
    .filter((t) => showDone || !t.completed)
    .filter((t) => matches(t.text, categoryName(t.categoryId)))
    .sort((a, b) => Number(a.completed) - Number(b.completed));
  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <section className="rounded-3xl border border-line bg-surface">
      <div className="flex items-baseline justify-between gap-3 px-5 pb-3 pt-5">
        <h2 className="font-display text-3xl tracking-tight">All tasks</h2>
        {doneCount > 0 && (
          <button onClick={onClearCompleted} className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline">
            Clear {doneCount} done
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
        {chips.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              aria-pressed={active}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                active ? "border-brand bg-brand text-brand-ink" : "border-line text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {c.accent && <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} />}
              {c.name}
              <span className={active ? "opacity-70" : "text-faint"}>{c.count}</span>
            </button>
          );
        })}
      </div>

      <div className="px-5">
        <AddTaskForm onAdd={(text) => onAdd(target, text)} placeholder="Add a task">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-label="Project for new task"
            className="h-8 max-w-[120px] shrink-0 truncate rounded-lg border border-line bg-surface px-1.5 text-[11px] text-muted outline-none"
          >
            <option value={GENERAL_CATEGORY}>General</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </AddTaskForm>
      </div>

      <ul className="mt-2 max-h-[60vh] overflow-y-auto px-3 pb-4">
        {loading && <li className="px-2 py-6 text-center text-sm text-faint">Loading…</li>}
        {!loading &&
          shown.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              accent={accentOf(t.categoryId)}
              onToggle={onToggle}
              onDelete={onDelete}
              meta={
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentOf(t.categoryId) }} />
                  {categoryName(t.categoryId)}
                </p>
              }
            />
          ))}
        {!loading && !shown.length && <li className="px-2 py-8 text-center text-sm text-faint">Nothing here. Enjoy it.</li>}
      </ul>
    </section>
  );
}
