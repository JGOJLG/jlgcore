"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthGate";
import {
  categoryName,
  displayUrl,
  GENERAL_CATEGORY,
  isExternal,
  Project,
  projects,
  quickLinkGroups,
} from "@/lib/sites";

type Task = { id: string; categoryId: string; text: string; completed: boolean; position: number };
type Row = { id: string; category_id: string; text: string; completed: boolean | null; position: number | null };

const COLUMNS = "id, category_id, text, completed, position";
const SHOW_DONE_KEY = "jlg-core-show-completed";
const toTask = (r: Row): Task => ({
  id: r.id,
  categoryId: r.category_id,
  text: r.text,
  completed: r.completed ?? false,
  position: r.position ?? 0,
});

function linkProps(url: string) {
  return isExternal(url) ? { href: url, target: "_blank", rel: "noopener noreferrer" } : { href: url };
}

export default function Home() {
  const { userId, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const openCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.length - openCount;
  const visible = (list: Task[]) => (showDone ? list : list.filter((t) => !t.completed));
  const allVisible = visible(tasks);

  const pill = "rounded-full border border-[#d8d1c5] bg-white/50 px-3 py-1.5 text-xs";

  return (
    <main className="min-h-screen bg-[#f5f1e9] px-4 py-4 text-[#26322c] sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <header className="rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] px-7 py-8 sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-[#7c8881]">The center of everything</p>
              <h1 className="text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.8] tracking-[-0.075em]">JLG CORE</h1>
            </div>
            <div className="max-w-md sm:text-right">
              <p className="text-sm leading-6 text-[#6d7771]">
                One home for every business, platform, project, and idea in the JLG ecosystem.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
                <span className={pill}>{openCount} open</span>
                <span className={pill}>{doneCount} done</span>
                <button onClick={toggleShowDone} aria-pressed={showDone} className={`${pill} hover:bg-white`}>
                  {showDone ? "Hide completed" : "Show completed"}
                </button>
                <button onClick={signOut} className={`${pill} hover:bg-white`}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="flex items-center justify-between rounded-2xl border border-[#e6d2d2] bg-[#fff7f7] px-4 py-3 text-sm text-[#955f5f]">
            {error}
            <button onClick={() => setError("")} className="text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <p className="px-2 py-10 text-center text-sm text-[#65716a]">Loading your saved tasks…</p>
        ) : (
          <>
            <section aria-label="Projects" className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  tasks={visible(tasks.filter((t) => t.categoryId === p.id))}
                  onAdd={(text) => addTask(p.id, text)}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              {quickLinkGroups.map((g) => (
                <div key={g.title} className="rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] p-6 sm:p-8">
                  <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#7c8881]">{g.title}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {g.links.map((l) => (
                      <a key={l.url} {...linkProps(l.url)} className="rounded-2xl border border-[#ded6c8] bg-white/45 p-4 transition hover:bg-white">
                        <p className="font-medium">{l.name}</p>
                        <p className="mt-1 text-xs text-[#78817c]">{l.label}</p>
                        <p className="mt-3 truncate text-xs underline">{displayUrl(l.url)} ↗</p>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-[30px] border border-[#d7d0c5] bg-[#ece7df]">
              <div className="flex items-end justify-between gap-3 border-b border-black/10 px-6 py-6 sm:px-8">
                <div>
                  <h2 className="text-4xl font-medium tracking-[-0.03em]">To Do</h2>
                  <p className="mt-1 text-xs text-[#78817c]">Everything across every project, in one list.</p>
                </div>
                {doneCount > 0 && (
                  <button onClick={clearCompleted} className="text-xs underline">
                    Clear completed
                  </button>
                )}
              </div>
              <div className="bg-[#fbf8f2]/70 p-6 sm:p-8">
                <AddTaskForm onAdd={(text) => addTask(GENERAL_CATEGORY, text)} placeholder="Add a general task" large />
                <ul className="mt-5 space-y-2">
                  {allVisible.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/60 px-4 py-3">
                      <Check task={t} onToggle={toggleTask} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${t.completed ? "line-through opacity-50" : ""}`}>{t.text}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#89918c]">{categoryName(t.categoryId)}</p>
                      </div>
                      <button onClick={() => deleteTask(t.id)} className="text-xs text-[#8b8179] hover:underline">
                        Delete
                      </button>
                    </li>
                  ))}
                  {!allVisible.length && <li className="text-sm text-[#89918c]">All clear.</li>}
                </ul>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Check({ task, onToggle, small }: { task: Task; onToggle: (id: string) => void; small?: boolean }) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      aria-label={task.completed ? `Mark "${task.text}" as not done` : `Mark "${task.text}" as done`}
      aria-pressed={task.completed}
      className={`${small ? "mt-0.5 h-4 w-4" : "h-5 w-5"} shrink-0 rounded-full border border-black/25 ${
        task.completed ? "bg-[#26322c]" : "bg-white/70"
      }`}
    />
  );
}

function AddTaskForm({ onAdd, placeholder, large }: { onAdd: (text: string) => Promise<boolean>; placeholder: string; large?: boolean }) {
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
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`min-w-0 flex-1 rounded-2xl border border-black/10 bg-white/60 px-4 outline-none focus:border-black/30 ${
          large ? "h-12 text-sm" : "h-10 text-xs"
        }`}
      />
      <button disabled={busy} className={`rounded-2xl bg-[#26322c] text-white disabled:opacity-60 ${large ? "px-5 text-sm" : "px-3 text-xs"}`}>
        Add
      </button>
    </form>
  );
}

function ProjectCard({
  project,
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  project: Project;
  tasks: Task[];
  onAdd: (text: string) => Promise<boolean>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className={`rounded-[26px] border p-5 ${project.tone} ${project.featured ? "sm:col-span-2" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] opacity-55">{project.label}</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">{project.name}</h2>
        </div>
        {project.url && (
          <a {...linkProps(project.url)} className="shrink-0 rounded-full border border-black/10 bg-white/40 px-3 py-1.5 text-[11px] hover:bg-white/80">
            Open ↗
          </a>
        )}
      </div>
      {project.url && <p className="mt-2 truncate text-xs opacity-60">{displayUrl(project.url)}</p>}
      {project.links && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {project.links.map((l) => (
            <a key={l.url} {...linkProps(l.url)} className="text-xs underline opacity-80 hover:opacity-100">
              {l.label}
            </a>
          ))}
        </div>
      )}
      <ul className="mt-4 space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-start gap-2 rounded-2xl bg-white/35 px-3 py-2.5">
            <Check task={t} onToggle={onToggle} small />
            <p className={`min-w-0 flex-1 text-xs leading-5 ${t.completed ? "line-through opacity-45" : ""}`}>{t.text}</p>
            <button onClick={() => onDelete(t.id)} aria-label={`Delete "${t.text}"`} className="px-1 text-sm leading-none opacity-40 hover:opacity-80">
              ×
            </button>
          </li>
        ))}
        {!tasks.length && <li className="text-xs opacity-45">No checklist items yet.</li>}
      </ul>
      <div className="mt-4">
        <AddTaskForm onAdd={onAdd} placeholder="Add checklist item" />
      </div>
    </article>
  );
}
