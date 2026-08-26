"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  label: string;
  url?: string;
  displayUrl?: string;
  className: string;
  featured?: boolean;
};

type Task = {
  id: string;
  categoryId: string;
  text: string;
  completed: boolean;
  position: number;
};

type SmallBuild = {
  name: string;
  label: string;
  url: string;
  displayUrl: string;
};

const categories: Category[] = [
  { id: "jgo-hire", name: "JGO Hire", label: "Career Coaching", url: "https://jgohire.com", displayUrl: "jgohire.com", className: "bg-[#dce7df] border-[#c6d5ca]", featured: true },
  { id: "jlg-collective", name: "JLG Collective", label: "Creative Collective", url: "https://jlgcollective.com", displayUrl: "jlgcollective.com", className: "bg-[#f0dfd2] border-[#e1cbbb]" },
  { id: "vidley", name: "Vidley Digital", label: "Digital Studio", url: "https://vidleydigital.com", displayUrl: "vidleydigital.com", className: "bg-[#dce8ea] border-[#c7d9dc]" },
  { id: "laif", name: "LAIF", label: "Personal OS", url: "https://laif.jlgcore.com", displayUrl: "laif.jlgcore.com", className: "bg-[#eee8cf] border-[#ddd5b7]" },
  { id: "jlg-core", name: "JLG Core", label: "Central Hub", url: "https://jlgcore.com", displayUrl: "jlgcore.com", className: "bg-[#e5dfee] border-[#d5cce2]" },
  { id: "jthc", name: "JTHC", label: "Health + Wellness", url: "https://admin.jillthehealthcoach.com", displayUrl: "admin.jillthehealthcoach.com", className: "bg-[#f1dfe0] border-[#e2c9cb]" },
  { id: "jlg-creative", name: "JLG Creative", label: "Content Calendar", url: "https://laif.jlgcore.com/jlg", displayUrl: "laif.jlgcore.com/jlg", className: "bg-[#eadfd7] border-[#dbc9bd]" },
  { id: "devices", name: "Devices", label: "Technology", className: "bg-[#e1e8e8] border-[#cbd7d7]" },
];

const smallBuilds: SmallBuild[] = [
  { name: "Kirstin Wedding Hub", label: "Wedding Planning", url: "https://laif.jlgcore.com/kirstin", displayUrl: "laif.jlgcore.com/kirstin" },
  { name: "Letters to Kirstin", label: "Wedding Letters", url: "https://letterstokirstin.com", displayUrl: "letterstokirstin.com" },
  { name: "Kirstin Admin", label: "Letters Admin", url: "https://letterstokirstin.com/admin", displayUrl: "letterstokirstin.com/admin" },
  { name: "Gemma Wedding Hub", label: "Wedding Planning", url: "https://laif.jlgcore.com/gemma", displayUrl: "laif.jlgcore.com/gemma" },
  { name: "JGO OS", label: "Coaching + Client Portal", url: "https://portal.jgohire.com", displayUrl: "portal.jgohire.com" },
  { name: "JTS", label: "Applicant Tracking System", url: "https://jts-seven.vercel.app", displayUrl: "jts-seven.vercel.app" },
  { name: "JTHC Public Site", label: "Health + Wellness", url: "https://jillthehealthcoach.com", displayUrl: "jillthehealthcoach.com" },
  { name: "JTHC Staging", label: "Website Staging", url: "https://new.jillthehealthcoach.com", displayUrl: "new.jillthehealthcoach.com" },
];

const starterTasks: Omit<Task, "id">[] = [
  { categoryId: "jgo-hire", text: "Finish the JGO Hire client timeline", completed: false, position: 0 },
  { categoryId: "jgo-hire", text: "Add Leads to the main dashboard navigation", completed: false, position: 1 },
  { categoryId: "jthc", text: "Redesign the public Articles page", completed: false, position: 2 },
  { categoryId: "jthc", text: "Finish the shared Media Library", completed: false, position: 3 },
  { categoryId: "jthc", text: "Build the Document Library", completed: false, position: 4 },
  { categoryId: "laif", text: "Continue building out the Money section", completed: false, position: 5 },
  { categoryId: "devices", text: "List every laptop, phone, tablet, and monitor", completed: false, position: 6 },
  { categoryId: "devices", text: "Document which projects are on each device", completed: false, position: 7 },
  { categoryId: "jlg-core", text: "Build the JLG Core master dashboard", completed: false, position: 8 },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTasks, setNewTasks] = useState<Record<string, string>>({});
  const [masterTask, setMasterTask] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    loadTasks(userId);
  }, [userId]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginError("That email or password is not correct.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setTasks([]);
  }

  async function loadTasks(uid: string) {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("jlg_core_tasks")
      .select("id, category_id, text, completed, position")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Unable to load JLG Core tasks:", error);
      setErrorMessage("JLG Core could not load your saved data.");
      setIsLoading(false);
      return;
    }

    if ((data ?? []).length > 0) {
      setTasks((data ?? []).map((task) => ({ id: task.id, categoryId: task.category_id, text: task.text, completed: task.completed ?? false, position: task.position ?? 0 })));
      setIsLoading(false);
      return;
    }

    const { data: insertedTasks, error: insertError } = await supabase
      .from("jlg_core_tasks")
      .insert(starterTasks.map((task) => ({ user_id: uid, category_id: task.categoryId, text: task.text, completed: task.completed, position: task.position })))
      .select("id, category_id, text, completed, position");

    if (insertError) {
      console.error("Unable to seed JLG Core tasks:", insertError);
      setErrorMessage("JLG Core could not create your starter data.");
      setIsLoading(false);
      return;
    }

    setTasks((insertedTasks ?? []).map((task) => ({ id: task.id, categoryId: task.category_id, text: task.text, completed: task.completed ?? false, position: task.position ?? 0 })));
    setIsLoading(false);
  }

  const visibleMasterTasks = useMemo(() => tasks.filter((task) => showCompleted || !task.completed), [tasks, showCompleted]);
  const openTaskCount = tasks.filter((task) => !task.completed).length;
  const completedTaskCount = tasks.filter((task) => task.completed).length;

  async function addCategoryTask(event: FormEvent<HTMLFormElement>, categoryId: string) {
    event.preventDefault();
    if (!userId) return;
    const taskText = newTasks[categoryId]?.trim();
    if (!taskText) return;

    const { data, error } = await supabase.from("jlg_core_tasks").insert({ user_id: userId, category_id: categoryId, text: taskText, completed: false, position: tasks.length }).select("id, category_id, text, completed, position").single();
    if (error || !data) {
      console.error("Unable to add JLG Core task:", error);
      setErrorMessage("JLG Core could not save that task.");
      return;
    }

    setTasks((current) => [{ id: data.id, categoryId: data.category_id, text: data.text, completed: data.completed ?? false, position: data.position ?? tasks.length }, ...current]);
    setNewTasks((current) => ({ ...current, [categoryId]: "" }));
  }

  async function addMasterTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;
    const taskText = masterTask.trim();
    if (!taskText) return;

    const { data, error } = await supabase.from("jlg_core_tasks").insert({ user_id: userId, category_id: "to-do", text: taskText, completed: false, position: tasks.length }).select("id, category_id, text, completed, position").single();
    if (error || !data) {
      console.error("Unable to add general JLG Core task:", error);
      setErrorMessage("JLG Core could not save that task.");
      return;
    }

    setTasks((current) => [{ id: data.id, categoryId: data.category_id, text: data.text, completed: data.completed ?? false, position: data.position ?? tasks.length }, ...current]);
    setMasterTask("");
  }

  async function toggleTask(taskId: string) {
    const selectedTask = tasks.find((task) => task.id === taskId);
    if (!selectedTask) return;

    const { data, error } = await supabase.from("jlg_core_tasks").update({ completed: !selectedTask.completed }).eq("id", taskId).select("id, category_id, text, completed, position").single();
    if (error || !data) {
      setErrorMessage("JLG Core could not update that task.");
      return;
    }

    setTasks((current) => current.map((task) => task.id === taskId ? { id: data.id, categoryId: data.category_id, text: data.text, completed: data.completed ?? false, position: data.position ?? task.position } : task));
  }

  async function deleteTask(taskId: string) {
    const { error } = await supabase.from("jlg_core_tasks").delete().eq("id", taskId);
    if (error) {
      setErrorMessage("JLG Core could not delete that task.");
      return;
    }
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  async function clearCompletedTasks() {
    const ids = tasks.filter((task) => task.completed).map((task) => task.id);
    if (!ids.length) return;
    const { error } = await supabase.from("jlg_core_tasks").delete().in("id", ids);
    if (error) {
      setErrorMessage("JLG Core could not clear completed tasks.");
      return;
    }
    setTasks((current) => current.filter((task) => !task.completed));
  }

  function getCategoryTasks(categoryId: string) { return tasks.filter((task) => task.categoryId === categoryId); }
  function getCategoryName(categoryId: string) { return categoryId === "to-do" ? "General" : categories.find((category) => category.id === categoryId)?.name ?? "Other"; }

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f5f1e9] px-6 text-[#65716a]"><p className="text-sm">Loading JLG Core...</p></main>;
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e9] px-5 py-10 text-[#26322c]">
        <div className="w-full max-w-md rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] p-7 shadow-sm sm:p-9">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#7c8881]">The center of everything</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em]">JLG CORE</h1>
          <p className="mt-4 text-sm leading-6 text-[#6d7771]">Sign in with the same account you use for LAIF. Your JLG Core data will then stay synced across every computer and device.</p>
          <form onSubmit={signIn} className="mt-7 space-y-4">
            <label className="block"><span className="text-xs font-medium text-[#66716b]">Email</span><input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="mt-2 h-12 w-full rounded-[16px] border border-[#d8d1c5] bg-white px-4 text-sm outline-none focus:border-[#87968e]" /></label>
            <label className="block"><span className="text-xs font-medium text-[#66716b]">Password</span><input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="mt-2 h-12 w-full rounded-[16px] border border-[#d8d1c5] bg-white px-4 text-sm outline-none focus:border-[#87968e]" /></label>
            {loginError ? <p className="rounded-[14px] border border-[#e6d2d2] bg-[#fff7f7] px-4 py-3 text-sm text-[#955f5f]">{loginError}</p> : null}
            <button type="submit" className="h-12 w-full rounded-[16px] bg-[#26322c] px-6 text-sm font-medium text-white transition hover:bg-[#34423b]">Sign in</button>
          </form>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f5f1e9] px-6 text-[#65716a]"><p className="text-sm">Loading your saved JLG Core...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f5f1e9] px-4 py-4 text-[#26322c] sm:px-6 sm:py-5">
      <div className="mx-auto max-w-[1500px]">
        <header className="relative mb-4 overflow-hidden rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] px-7 py-7 sm:px-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#d8e4dc] blur-3xl" />
          <div className="absolute bottom-[-90px] left-[35%] h-48 w-64 rounded-full bg-[#ead9c9] blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-[#7c8881]">The center of everything</p><h1 className="text-[clamp(3.8rem,8vw,8rem)] font-semibold leading-[0.8] tracking-[-0.075em]">JLG CORE</h1></div>
            <div className="max-w-md sm:text-right"><p className="text-sm leading-6 text-[#6d7771]">One home for every business, platform, project, and idea in the JLG ecosystem.</p><div className="mt-3 flex flex-wrap gap-2 sm:justify-end"><span className="rounded-full border border-[#d8d1c5] bg-white/45 px-3 py-1.5 text-xs text-[#66716b]">{openTaskCount} open</span><span className="rounded-full border border-[#d8d1c5] bg-white/45 px-3 py-1.5 text-xs text-[#66716b]">{completedTaskCount} completed</span><button type="button" onClick={signOut} className="rounded-full border border-[#d8d1c5] bg-white/45 px-3 py-1.5 text-xs text-[#66716b] hover:bg-white">Sign out</button></div></div>
          </div>
        </header>

        {errorMessage && <div className="mb-4 rounded-[18px] border border-[#e6d2d2] bg-[#fff7f7] px-4 py-3 text-sm text-[#955f5f]">{errorMessage}</div>}

        <section className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => <ProjectCard key={category.id} category={category} tasks={getCategoryTasks(category.id)} newTask={newTasks[category.id] ?? ""} onNewTaskChange={(value) => setNewTasks((current) => ({ ...current, [category.id]: value }))} onAddTask={(event) => addCategoryTask(event, category.id)} onToggleTask={toggleTask} onDeleteTask={deleteTask} />)}
        </section>

        <section className="mt-4 overflow-hidden rounded-[30px] border border-[#d7d0c5] bg-[#ece7df]">
          <div className="border-b border-black/10 px-5 py-6 sm:px-8 sm:py-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#7c827d]">Master List</p><h2 className="mt-2 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">To Do</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#68736d]">Every task added to a project above automatically appears here.</p></div><button type="button" onClick={() => setShowCompleted((current) => !current)} className="h-11 self-start rounded-full border border-black/15 bg-white/35 px-5 text-sm font-medium transition hover:bg-white/60 lg:self-auto">{showCompleted ? "Hide completed" : "Show completed"}</button></div></div>
          <div className="bg-[#fbf8f2]/70 p-5 sm:p-8">
            <form onSubmit={addMasterTask} className="flex flex-col gap-2 sm:flex-row"><input type="text" value={masterTask} onChange={(event) => setMasterTask(event.target.value)} placeholder="Add a general task" className="h-12 flex-1 rounded-[16px] border border-[#d8d1c5] bg-white/80 px-4 text-sm outline-none transition placeholder:text-[#959c97] focus:border-[#87968e] focus:ring-4 focus:ring-[#87968e]/10" /><button type="submit" disabled={!masterTask.trim()} className="h-12 rounded-[16px] bg-[#26322c] px-6 text-sm font-medium text-white transition hover:bg-[#34423b] disabled:cursor-not-allowed disabled:opacity-40">Add task</button></form>
            <div className="mt-5 grid gap-2 lg:grid-cols-2">{visibleMasterTasks.length ? visibleMasterTasks.map((task) => <div key={task.id} className="group flex items-center gap-3 rounded-[18px] border border-[#ded8cd] bg-white/70 px-4 py-3.5 transition hover:bg-white"><TaskCheckbox completed={task.completed} onClick={() => toggleTask(task.id)} /><div className="min-w-0 flex-1"><p className="mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#89918d]">{getCategoryName(task.categoryId)}</p><button type="button" onClick={() => toggleTask(task.id)} className={`w-full text-left text-sm leading-5 ${task.completed ? "text-[#89918d] line-through" : "text-[#344039]"}`}>{task.text}</button></div><DeleteButton onClick={() => deleteTask(task.id)} /></div>) : <div className="rounded-[22px] border border-dashed border-[#cec7bb] bg-white/30 px-6 py-16 text-center lg:col-span-2"><p className="text-lg font-medium tracking-[-0.025em]">Nothing here yet</p><p className="mt-1 text-sm text-[#77817b]">Add a general task or add one inside a project card.</p></div>}</div>
            {completedTaskCount > 0 && <div className="mt-5 flex justify-end"><button type="button" onClick={clearCompletedTasks} className="text-xs font-medium text-[#737d77] underline decoration-[#aeb5b1] underline-offset-4 transition hover:text-[#26322c]">Clear all completed tasks</button></div>}
          </div>
        </section>

        <section className="mt-4 rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#7c8881]">Everything I&apos;ve Built</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em]">Sites + Side Builds</h2>
            </div>
            <p className="max-w-md text-xs leading-5 text-[#77817b] sm:text-right">A quick launchpad for the smaller sites, wedding builds, internal tools, and one-off projects living across the JLG ecosystem.</p>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {smallBuilds.map((build) => (
              <a key={build.url} href={build.url} target="_blank" rel="noreferrer" className="group flex min-h-[104px] items-center justify-between gap-4 rounded-[18px] border border-[#ddd6ca] bg-white/65 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <div className="min-w-0">
                  <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#89918d]">{build.label}</p>
                  <p className="mt-1.5 text-sm font-semibold text-[#344039]">{build.name}</p>
                  <p className="mt-1 truncate text-[11px] text-[#7c8881]">{build.displayUrl}</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8d1c5] bg-[#f5f1e9] text-sm text-[#68736d] transition group-hover:bg-[#26322c] group-hover:text-white">↗</span>
              </a>
            ))}
          </div>
        </section>

        <footer className="py-7 text-center"><p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#929a95]">Built with purpose. Connected by design.</p></footer>
      </div>
    </main>
  );
}

function ProjectCard({ category, tasks, newTask, onNewTaskChange, onAddTask, onToggleTask, onDeleteTask }: { category: Category; tasks: Task[]; newTask: string; onNewTaskChange: (value: string) => void; onAddTask: (event: FormEvent<HTMLFormElement>) => void; onToggleTask: (taskId: string) => void; onDeleteTask: (taskId: string) => void; }) {
  const openTasks = tasks.filter((task) => !task.completed).length;
  return (
    <article className={`relative flex min-h-[270px] flex-col overflow-hidden rounded-[26px] border p-5 ${category.className} ${category.featured ? "lg:col-span-2" : ""}`}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#66736c]">{category.label}</p>{openTasks > 0 && <p className="mt-2 text-xs text-[#748079]">{openTasks} open {openTasks === 1 ? "task" : "tasks"}</p>}</div>{category.url && <a href={category.url} target="_blank" rel="noreferrer" aria-label={`Open ${category.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#506058]/25 bg-white/30 text-base transition duration-300 hover:rotate-45 hover:bg-[#26322c] hover:text-white">↗</a>}</div>
      <div className="mt-16"><h2 className={`font-medium leading-none tracking-[-0.045em] ${category.featured ? "text-4xl sm:text-5xl" : "text-3xl sm:text-[2rem]"}`}>{category.name}</h2>{category.displayUrl && <p className="mt-3 text-xs text-[#68736d]">{category.displayUrl}</p>}</div>
      <div className="mt-6 border-t border-black/10 pt-4"><form onSubmit={onAddTask} className="flex items-center gap-2"><input type="text" value={newTask} onChange={(event) => onNewTaskChange(event.target.value)} placeholder="Add a task" className="h-10 min-w-0 flex-1 rounded-[13px] border border-black/10 bg-white/45 px-3 text-xs outline-none transition placeholder:text-[#7d8781] focus:border-black/20 focus:bg-white/70" /><button type="submit" disabled={!newTask.trim()} aria-label={`Add task to ${category.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#26322c] text-lg text-white transition hover:bg-[#34423b] disabled:cursor-not-allowed disabled:opacity-35">+</button></form><div className="mt-3 space-y-2">{tasks.map((task) => <div key={task.id} className="group flex items-center gap-2 rounded-[13px] border border-black/10 bg-white/35 px-3 py-2.5 transition hover:bg-white/55"><TaskCheckbox completed={task.completed} onClick={() => onToggleTask(task.id)} small /><button type="button" onClick={() => onToggleTask(task.id)} className={`min-w-0 flex-1 text-left text-xs leading-5 ${task.completed ? "text-[#7f8983] line-through" : "text-[#3d4942]"}`}>{task.text}</button><DeleteButton onClick={() => onDeleteTask(task.id)} small /></div>)}</div></div>
    </article>
  );
}

function TaskCheckbox({ completed, onClick, small = false }: { completed: boolean; onClick: () => void; small?: boolean; }) {
  return <button type="button" onClick={onClick} aria-label={completed ? "Mark task as incomplete" : "Mark task as complete"} className={`flex shrink-0 items-center justify-center rounded-full border transition ${small ? "h-5 w-5" : "h-6 w-6"} ${completed ? "border-[#34423b] bg-[#34423b] text-white" : "border-[#8e9993] bg-white/35 hover:border-[#34423b]"}`}>{completed && <span className={small ? "text-[9px]" : "text-xs"} aria-hidden="true">✓</span>}</button>;
}

function DeleteButton({ onClick, small = false }: { onClick: () => void; small?: boolean; }) {
  return <button type="button" onClick={onClick} aria-label="Delete task" className={`shrink-0 items-center justify-center rounded-full text-[#7f8983] transition hover:bg-white/55 hover:text-[#26322c] sm:opacity-0 sm:group-hover:opacity-100 ${small ? "flex h-6 w-6 text-sm" : "flex h-8 w-8 text-base"}`}>×</button>;
}
