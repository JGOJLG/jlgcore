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
      <main className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
          Loading JLG Core
        </div>
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

export function Mark({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="inline-flex shrink-0 items-center justify-center rounded-[30%] bg-brand font-display text-brand-ink"
    >
      <span style={{ fontSize: size * 0.56 }} className="leading-none">
        J
      </span>
    </span>
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
    "mt-2 h-12 w-full rounded-xl border border-line bg-raised px-4 text-sm text-ink outline-none transition focus:border-line-strong focus:ring-4 focus:ring-[color-mix(in_srgb,var(--brand)_10%,transparent)]";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, color-mix(in srgb, #c07a4a 22%, transparent), transparent)" }}
      />
      <div className="relative w-full max-w-[400px]">
        <div className="flex items-center gap-3">
          <Mark />
          <span className="text-sm font-medium tracking-tight">JLG Core</span>
        </div>
        <h1 className="mt-10 font-display text-6xl leading-[0.95] tracking-tight">
          Everything,
          <br />
          <span className="italic text-muted">in one place.</span>
        </h1>
        <form onSubmit={submit} className="mt-10 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted">Email</span>
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted">Password</span>
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
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}
          <button
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-brand text-sm font-medium text-brand-ink transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Enter JLG Core"}
          </button>
        </form>
        <p className="mt-6 text-xs text-faint">Private dashboard · sign in with your LAIF account</p>
      </div>
    </main>
  );
}
