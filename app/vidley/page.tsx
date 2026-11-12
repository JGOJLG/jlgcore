import Link from "next/link";

const tools = [
  { kind: "Website", name: "Vidley Digital", desc: "vidleydigital.com", url: "https://vidleydigital.com" },
  { kind: "Admin", name: "Vidley Admin", desc: "admin.vidleydigital.com", url: "https://admin.vidleydigital.com" },
  {
    kind: "Private tool",
    name: "Coupon Manager",
    desc: "Create, pause and delete Vidley coupon codes",
    url: "https://jlg-collective-git-main-jgohire.vercel.app/vidley/coupons",
  },
];

export default function VidleyTools() {
  return (
    <main className="min-h-screen bg-paper px-5 py-10 text-ink sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← JLG Core
        </Link>
        <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="h-1 bg-[#3f7f8c]" />
          <div className="p-7 sm:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-faint">Vidley Digital</p>
            <h1 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">Vidley Tools</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Quick access to the Vidley website and private business tools.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {tools.map((t) => (
                <a
                  key={t.url}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-line bg-raised p-5 transition hover:-translate-y-0.5 hover:border-line-strong"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-faint">{t.kind}</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">{t.name}</h2>
                  <p className="mt-1 text-xs text-muted">{t.desc} ↗</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
