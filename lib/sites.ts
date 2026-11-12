// Single source of truth for every site JLG Core links to.
// Edit links here — the dashboard reads everything from this file.

export type Project = {
  id: string; // matches jlg_core_tasks.category_id — do not rename existing ids
  name: string;
  label: string;
  url?: string;
  links?: { label: string; url: string }[];
  tone: string;
  featured?: boolean;
};

export type QuickLink = { name: string; label: string; url: string };
export type QuickLinkGroup = { title: string; links: QuickLink[] };

export const projects: Project[] = [
  {
    id: "jgo-hire",
    name: "JGO Hire",
    label: "Career Coaching",
    url: "https://jgohire.com",
    links: [{ label: "Client portal", url: "https://portal.jgohire.com" }],
    tone: "bg-[#dce7df] border-[#c6d5ca]",
    featured: true,
  },
  {
    id: "jthc",
    name: "Jill the Health Coach",
    label: "Health + Wellness",
    url: "https://jillthehealthcoach.com",
    links: [
      { label: "Admin", url: "https://admin.jillthehealthcoach.com" },
      { label: "Staging", url: "https://new.jillthehealthcoach.com" },
    ],
    tone: "bg-[#f1dfe0] border-[#e2c9cb]",
    featured: true,
  },
  {
    id: "vidley",
    name: "Vidley Digital",
    label: "Digital Studio",
    url: "https://vidleydigital.com",
    links: [
      { label: "Admin", url: "https://admin.vidleydigital.com" },
      { label: "Tools", url: "/vidley" },
    ],
    tone: "bg-[#dce8ea] border-[#c7d9dc]",
  },
  {
    id: "laif",
    name: "LAIF",
    label: "Personal OS",
    url: "https://laif.jlgcore.com",
    tone: "bg-[#eee8cf] border-[#ddd5b7]",
  },
  {
    id: "shelflaif",
    name: "ShelfLAIF",
    label: "Social Reading",
    url: "https://shelflaif.jlgcore.com",
    tone: "bg-[#e2e8dc] border-[#cbd6c3]",
  },
  {
    id: "literal-trash",
    name: "Literal Trash",
    label: "Book Club",
    url: "https://literaltrash.jlgcore.com",
    tone: "bg-[#dfeafb] border-[#c9dbf4]",
  },
  {
    id: "food-freedom",
    name: "Food Freedom",
    label: "Food + Wellness",
    url: "https://foodfreedom.jlgcore.com",
    tone: "bg-[#f4dfe8] border-[#e8cbd8]",
  },
  {
    id: "jlg-book-studio",
    name: "JLG Book Studio",
    label: "Writing + Publishing",
    url: "https://book.jlgcore.com",
    tone: "bg-[#f0e1e5] border-[#e1cdd4]",
  },
  {
    id: "jlg-creative",
    name: "JLG Creative Studio",
    label: "Social Content Studio",
    url: "https://studio.jlgcollective.com",
    tone: "bg-[#eadfd7] border-[#dbc9bd]",
  },
  {
    id: "jlg-collective",
    name: "JLG Collective",
    label: "Creative Collective",
    url: "https://github.com/JGOJLG/jlg-collective",
    tone: "bg-[#f0dfd2] border-[#e1cbbb]",
  },
  {
    id: "jlg-core",
    name: "JLG Core",
    label: "This dashboard",
    tone: "bg-[#e5dfee] border-[#d5cce2]",
  },
  {
    id: "devices",
    name: "Devices",
    label: "Technology",
    tone: "bg-[#e1e8e8] border-[#cbd7d7]",
  },
];

export const quickLinkGroups: QuickLinkGroup[] = [
  {
    title: "Weddings",
    links: [
      { name: "Kirstin Wedding Hub", label: "Wedding planning", url: "https://laif.jlgcore.com/kirstin" },
      { name: "Letters to Kirstin", label: "Wedding letters", url: "https://letterstokirstin.com" },
      { name: "Letters Admin", label: "Letters to Kirstin admin", url: "https://letterstokirstin.com/admin" },
      { name: "Gemma Wedding Hub", label: "Wedding planning", url: "https://laif.jlgcore.com/gemma" },
    ],
  },
  {
    title: "Other builds",
    links: [
      { name: "Rach Studio", label: "Creator finance + campaigns", url: "https://rach.jlgcore.com" },
      { name: "JTS", label: "Applicant tracking", url: "https://jts-seven.vercel.app" },
      { name: "DWTS Fantasy", label: "Fantasy elimination game", url: "https://dwts.jlgcore.com" },
    ],
  },
];

export const GENERAL_CATEGORY = "to-do";

export function categoryName(id: string) {
  if (id === GENERAL_CATEGORY) return "General";
  return projects.find((p) => p.id === id)?.name ?? "Other";
}

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}
