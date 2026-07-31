const links = [
  {
    name: "JGO Hire",
    label: "Career Coaching",
    url: "https://jgohire.com",
    className: "bg-[#dce7df] border-[#c6d5ca]",
  },
  {
    name: "JLG Collective",
    label: "Creative Collective",
    url: "https://jlgcollective.com",
    className: "bg-[#f0dfd2] border-[#e1cbbb]",
  },
  {
    name: "Vidley Digital",
    label: "Digital Studio",
    url: "https://vidleydigital.com",
    className: "bg-[#dce8ea] border-[#c7d9dc]",
  },
  {
    name: "LAIF",
    label: "Personal OS",
    url: "https://laif.jlgcore.com",
    className: "bg-[#eee8cf] border-[#ddd5b7]",
  },
  {
    name: "JGO Hire Admin",
    label: "Business Portal",
    url: "https://admin.jgohire.com",
    className: "bg-[#e5dfee] border-[#d5cce2]",
  },
  {
    name: "JTHC Admin",
    label: "Content Management",
    url: "https://admin.jillthehealthcoach.com",
    className: "bg-[#f1dfe0] border-[#e2c9cb]",
  },
  {
    name: "Jill the Health Coach",
    label: "Health + Wellness",
    url: "https://new.jillthehealthcoach.com",
    className: "bg-[#dfe8d8] border-[#ccd9c2]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1e9] px-4 py-4 text-[#26322c] sm:px-6 sm:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-[1500px] flex-col gap-4">
        <header className="relative overflow-hidden rounded-[30px] border border-[#ded6c8] bg-[#fbf8f2] px-7 py-7 sm:px-10">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#d8e4dc] blur-3xl" />
          <div className="absolute bottom-[-90px] left-[35%] h-48 w-64 rounded-full bg-[#ead9c9] blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.35em] text-[#7c8881]">
                The center of everything
              </p>

              <h1 className="text-[clamp(3.8rem,8vw,8rem)] font-semibold leading-[0.8] tracking-[-0.075em]">
                JLG CORE
              </h1>
            </div>

            <p className="max-w-md text-sm leading-6 text-[#6d7771] sm:text-right">
              One home for every business, platform, project, and idea in the
              JLG ecosystem.
            </p>
          </div>
        </header>

        <section className="grid flex-1 auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link, index) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={`group relative flex min-h-[145px] flex-col justify-between overflow-hidden rounded-[26px] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(64,72,66,0.12)] sm:min-h-0 ${
                link.className
              } ${index === 0 ? "lg:col-span-2" : ""}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#66736c]">
                  {link.label}
                </p>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#506058]/25 bg-white/30 text-base transition duration-300 group-hover:rotate-45 group-hover:bg-[#26322c] group-hover:text-white">
                  ↗
                </span>
              </div>

              <div>
                <h2
                  className={`font-medium leading-none tracking-[-0.045em] ${
                    index === 0
                      ? "text-4xl sm:text-5xl"
                      : "text-3xl sm:text-[2rem]"
                  }`}
                >
                  {link.name}
                </h2>

                <p className="mt-3 text-xs text-[#68736d]">
                  {link.url.replace("https://", "")}
                </p>
              </div>
            </a>
          ))}

          <div className="flex min-h-[120px] flex-col justify-between rounded-[26px] border border-[#d7d0c5] bg-[#ece7df] p-5 sm:min-h-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#7c827d]">
              JLG CORE
            </p>

            <p className="max-w-[220px] text-xl font-medium leading-tight tracking-[-0.03em] text-[#59635e]">
              Built with purpose.
              <br />
              Connected by design.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}