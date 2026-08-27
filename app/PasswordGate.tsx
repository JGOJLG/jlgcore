"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CORE_EMAIL = "jen@jlgcollective.com";

export default function PasswordGate() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUnlocked(!!data.user);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUnlocked(!!session?.user);
      setReady(true);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function enter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: CORE_EMAIL,
      password,
    });
    if (authError) {
      setError("That password is not correct.");
      setSubmitting(false);
      return;
    }
    setPassword("");
    setUnlocked(true);
    setSubmitting(false);
  }

  if (!ready || unlocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#f5f1e9] px-5 py-10 text-[#26322c]">
      <div className="w-full max-w-md rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] p-7 shadow-sm sm:p-9">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#7c8881]">The center of everything</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em]">JLG CORE</h1>
        <p className="mt-4 text-sm leading-6 text-[#6d7771]">Enter your password to access JLG Core.</p>
        <form onSubmit={enter} className="mt-7 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[#66716b]">Password</span>
            <input
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-12 w-full rounded-[16px] border border-[#d8d1c5] bg-white px-4 text-sm outline-none focus:border-[#8d988f]"
            />
          </label>
          {error && <p className="rounded-[14px] border border-[#e6d2d2] bg-[#fff7f7] px-4 py-3 text-sm text-[#955f5f]">{error}</p>}
          <button disabled={submitting} className="h-12 w-full rounded-[16px] bg-[#26322c] px-6 text-sm font-medium text-white disabled:opacity-60">
            {submitting ? "Entering…" : "Enter JLG Core"}
          </button>
        </form>
      </div>
    </div>
  );
}
