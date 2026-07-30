const links = [
  {
    number: "01",
    name: "JGO Hire",
    description:
      "Career coaching, job search resources, and professional services.",
    url: "https://jgohire.com",
    displayUrl: "jgohire.com",
  },
  {
    number: "02",
    name: "JLG Collective",
    description: "The broader JLG brand and creative ecosystem.",
    url: "https://jlgcollective.com",
    displayUrl: "jlgcollective.com",
  },
  {
    number: "03",
    name: "Vidley Digital",
    description: "Digital products, websites, and creative development.",
    url: "https://vidleydigital.com",
    displayUrl: "vidleydigital.com",
  },
  {
    number: "04",
    name: "LAIF",
    description: "Personal planning, organization, and life management.",
    url: "https://laif.jlgcore.com",
    displayUrl: "laif.jlgcore.com",
  },
  {
    number: "05",
    name: "JGO Hire Admin",
    description: "Client, lead, service, and business management.",
    url: "https://admin.jgohire.com",
    displayUrl: "admin.jgohire.com",
  },
  {
    number: "06",
    name: "Jill the Health Coach Admin",
    description: "Content, article, recipe, and website management.",
    url: "https://admin.jillthehealthcoach.com",
    displayUrl: "admin.jillthehealthcoach.com",
  },
  {
    number: "07",
    name: "Jill the Health Coach",
    description: "Health, wellness, recipes, and practical guidance.",
    url: "https://new.jillthehealthcoach.com",
    displayUrl: "new.jillthehealthcoach.com",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#26322c]">
      <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        <section className="relative overflow-hidden rounded-[36px] border border-[#d9d2c4] bg-[#faf8f3] px-7 py-14 sm:px-12 sm:py-20 lg:min-h-[560px] lg:px-16 lg:py-16">
          <div className="absolute right-[-80px] top-[-100px] h-[320px] w-[320px] rounded-full bg-[#c9d4cc]/60 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[20%] h-[300px] w-[420px] rounded-full bg-[#d8c6ad]/40 blur-3xl" />

          <div className="relative flex min-h-[430px] flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#6f7c75]">
                The center of everything
              </p>

              <div className="h-3 w-3 rounded-full bg-[#94a69b]" />
            </div>

            <div className="py-16">
              <h1 className="text-[clamp(4.4rem,14vw,13rem)] font-semibold leading-[0.78] tracking-[-0.075em]">
                JLG
                <br />
                CORE
              </h1>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#ded8cc] pt-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-lg leading-8 text-[#68726d] sm:text-xl">
                One central home for the businesses, platforms, tools, and
                ideas built within the JLG ecosystem.
              </p>

              <p className="text-sm uppercase tracking-[0.22em] text-[#87918c]">
                Explore below
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {links.map((link, index) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={`group flex min-h-[330px] flex-col justify-between rounded-[32px] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(45,55,48,0.12)] sm:p-9 ${
                index === 0
                  ? "border-[#aab9af] bg-[#cbd7cf] md:col-span-2"
                  : index === 1
                    ? "border-[#d7c8b5] bg-[#e8ddce]"
                    : index === 2
                      ? "border-[#c8d3d6] bg-[#dce5e5]"
                      : index === 3
                        ? "border-[#c9c6b5] bg-[#e1dfcf]"
                        : "border-[#ded8cc] bg-[#faf8f3]"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-sm tracking-[0.2em] text-[#68736d]">
                  {link.number}
                </span>

                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#89978f]/50 text-xl transition duration-300 group-hover:rotate-45 group-hover:bg-[#26322c] group-hover:text-white">
                  ↗
                </span>
              </div>

              <div>
                <h2
                  className={`font-medium leading-none tracking-[-0.045em] ${
                    index === 0
                      ? "text-5xl sm:text-7xl lg:text-8xl"
                      : "text-4xl sm:text-5xl"
                  }`}
                >
                  {link.name}
                </h2>

                <p className="mt-5 max-w-xl text-base leading-7 text-[#5f6a64] sm:text-lg">
                  {link.description}
                </p>

                <p className="mt-8 text-sm font-medium uppercase tracking-[0.16em] text-[#6d7972]">
                  {link.displayUrl}
                </p>
              </div>
            </a>
          ))}
        </section>

        <footer className="flex flex-col gap-3 px-2 pb-4 pt-12 text-sm text-[#7e8882] sm:flex-row sm:items-center sm:justify-between">
          <p>JLG CORE</p>
          <p>The foundation behind everything.</p>
        </footer>
      </div>
    </main>
  );
}