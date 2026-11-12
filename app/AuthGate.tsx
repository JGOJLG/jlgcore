"use client";

import { createContext, FormEvent, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Auth = { userId: string; signOut: () => Promise<void> };
const AuthContext = createContext<Auth | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthGate>");
  return ctx;
}

const EMAIL_KEY = "jlg-core-email";

// Nothing behind this gate is rendered until Supabase confirms a signed-in user.
// Data access is additionally enforced server-side by RLS (jlg_core_members).
export default function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserId(data.user?.id ?? null);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      setUserId(session?.user?.id ?? null);
      setReady(true);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e9] text-sm text-[#65716a]">
        Loading JLG Core…
      </main>
    );
  }

  if (!userId) return <SignIn />;

  return (
    <AuthContext.Provider value={{ userId, signOut: async () => void (await supabase.auth.signOut()) }}>
      {children}
    </AuthContext.Provider>
  );
}

function SignIn() {
  const [email, setEmail] = useState(() => {
    try {
      return window.localStorage.getItem(EMAIL_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (authError) {
      setError("That email or password is not correct.");
      return;
    }
    try {
      window.localStorage.setItem(EMAIL_KEY, email.trim());
    } catch {}
    setPassword("");
  }

  const input =
    "mt-2 h-12 w-full rounded-2xl border border-[#d8d1c5] bg-white px-4 text-sm outline-none focus:border-[#8d988f]";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e9] px-5 py-10 text-[#26322c]">
      <div className="w-full max-w-md rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] p-7 shadow-sm sm:p-9">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#7c8881]">The center of everything</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em]">JLG CORE</h1>
        <p className="mt-4 text-sm leading-6 text-[#6d7771]">Private dashboard. Sign in with your LAIF account.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[#66716b]">Email</span>
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#66716b]">Password</span>
            <input
              type="password"
              required
              autoFocus={!!email}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </label>
          {error && (
            <p role="alert" className="rounded-2xl border border-[#e6d2d2] bg-[#fff7f7] px-4 py-3 text-sm text-[#955f5f]">
              {error}
            </p>
          )}
          <button disabled={submitting} className="h-12 w-full rounded-2xl bg-[#26322c] text-sm font-medium text-white disabled:opacity-60">
            {submitting ? "Signing in…" : "Enter JLG Core"}
          </button>
        </form>
      </div>
    </main>
  );
}
