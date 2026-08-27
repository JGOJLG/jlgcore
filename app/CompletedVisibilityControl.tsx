"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "jlg-core-show-completed";

function applyCompletedVisibility(showCompleted: boolean) {
  const completedButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button.line-through")
  );

  completedButtons.forEach((button) => {
    const row = button.closest<HTMLDivElement>("div.group.flex");
    if (row) row.style.display = showCompleted ? "" : "none";
  });
}

export default function CompletedVisibilityControl() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial = saved === "1";
    setShowCompleted(initial);

    const sync = () => {
      const signedIn = Array.from(document.querySelectorAll("button")).some(
        (button) => button.textContent?.trim() === "Sign out"
      );
      setVisible(signedIn);
      applyCompletedVisibility(initial);
    };

    sync();
    const observer = new MutationObserver(() => {
      const current = window.localStorage.getItem(STORAGE_KEY) === "1";
      const signedIn = Array.from(document.querySelectorAll("button")).some(
        (button) => button.textContent?.trim() === "Sign out"
      );
      setVisible(signedIn);
      window.requestAnimationFrame(() => applyCompletedVisibility(current));
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next = !showCompleted;
    setShowCompleted(next);
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    window.requestAnimationFrame(() => applyCompletedVisibility(next));
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-5 right-5 z-[100] rounded-full border border-[#d8d1c5] bg-[#fbf8f2]/95 px-4 py-2.5 text-xs font-semibold text-[#39463f] shadow-lg backdrop-blur hover:bg-white"
      aria-pressed={showCompleted}
    >
      {showCompleted ? "Hide completed" : "Show completed"}
    </button>
  );
}
