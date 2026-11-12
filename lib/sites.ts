// Single source of truth for every site JLG Core links to.
// Edit links here — the whole dashboard reads from this file.

export type SiteLink = { label: string; url: string };

export type Project = {
  id: string; // matches jlg_core_tasks.category_id — never rename an existing id
  name: string;
  short?: string; // used to name sub-links, e.g. "JTHC Admin"
  label: string;
  accent: string;
  url?: string;
  links?: SiteLink[];
};

export type QuickLink = { name: string; label: string; url: string; accent: string };
export type QuickLinkGroup = { title: string; links: QuickLink[] };

export const projects: Project[] = [
  {
    id: "jgo-hire",
    name: "JGO Hire",
    short: "JGO",
    label: "Career Coaching",
    accent: "#4f7a5f",
    url: "https://jgohire.com",
    links: [{ label: "Client portal", url: "https://portal.jgohire.com" }],
  },
  {
    id: "jthc",
    name: "Jill the Health Coach",
    short: "JTHC",
    label: "Health + Wellness",
    accent: "#b5646c",
    url: "https://jillthehealthcoach.com",
    links: [
      { label: "Admin", url: "https://admin.jillthehealthcoach.com" },
      { label: "Staging", url: "https://new.jillthehealthcoach.com" },
    ],
  },
  {
    id: "vidley",
    name: "Vidley Digital",
    short: "Vidley",
    label: "Digital Studio",
    accent: "#3f7f8c",
    url: "https://vidleydigital.com",
    links: [
      { label: "Admin", url: "https://admin.vidleydigital.com" },
      { label: "Tools", url: "/vidley" },
    ],
  },
  { id: "laif", name: "LAIF", label: "Personal OS", accent: "#b08a2e", url: "https://laif.jlgcore.com" },
  { id: "shelflaif", name: "ShelfLAIF", label: "Social Reading", accent: "#6f8f4e", url: "https://shelflaif.jlgcore.com" },
  { id: "literal-trash", name: "Literal Trash", label: "Book Club", accent: "#4f74b8", url: "https://literaltrash.jlgcore.com" },
  { id: "food-freedom", name: "Food Freedom", label: "Food + Wellness", accent: "#c0628f", url: "https://foodfreedom.jlgcore.com" },
  { id: "jlg-book-studio", name: "JLG Book Studio", label: "Writing + Publishing", accent: "#9b5a74", url: "https://book.jlgcore.com" },
  { id: "jlg-collective", name: "JLG Collective", label: "Creative Collective", accent: "#c07a4a", url: "https://jlgcollective.com" },
  { id: "jlg-creative", name: "JLG Creative Studio", label: "Social Content Studio", accent: "#a8714f", url: "https://studio.jlgcollective.com" },
  { id: "jlg-core", name: "JLG Core", label: "This dashboard", accent: "#6e5aa8" },
  { id: "devices", name: "Devices", label: "Technology", accent: "#5f7d7d" },
];

export const quickLinkGroups: QuickLinkGroup[] = [
  {
    title: "Weddings",
    links: [
      { name: "Kirstin Wedding Hub", label: "Wedding planning", url: "https://laif.jlgcore.com/kirstin", accent: "#b07a8a" },
      { name: "Letters to Kirstin", label: "Wedding letters", url: "https://letterstokirstin.com", accent: "#b07a8a" },
      { name: "Letters Admin", label: "Letters to Kirstin admin", url: "https://letterstokirstin.com/admin", accent: "#b07a8a" },
      { name: "Gemma Wedding Hub", label: "Wedding planning", url: "https://laif.jlgcore.com/gemma", accent: "#8a7ab0" },
    ],
  },
  {
    title: "Other builds",
    links: [
      { name: "Rach Studio", label: "Creator finance + campaigns", url: "https://rach.jlgcore.com", accent: "#c08a4a" },
      { name: "JTS", label: "Applicant tracking", url: "https://jts.jlgcore.com", accent: "#4f7a5f" },
      { name: "DWTS Fantasy", label: "Fantasy elimination game", url: "https://dwts.jlgcore.com", accent: "#b5646c" },
    ],
  },
];

export const GENERAL_CATEGORY = "to-do";

export function projectFor(id: string) {
  return projects.find((p) => p.id === id);
}

export function categoryName(id: string) {
  if (id === GENERAL_CATEGORY) return "General";
  return projectFor(id)?.name ?? "Other";
}

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

export function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Every destination on the dashboard, flattened for the launchpad and search.
export type LaunchItem = { key: string; name: string; sub: string; url: string; accent: string; group: string };

export const launchItems: LaunchItem[] = [
  ...projects.flatMap((p) => [
    ...(p.url ? [{ key: p.url, name: p.name, sub: p.label, url: p.url, accent: p.accent, group: "Businesses" }] : []),
    ...(p.links ?? []).map((l) => ({
      key: l.url,
      name: `${p.short ?? p.name} ${l.label}`,
      sub: l.label,
      url: l.url,
      accent: p.accent,
      group: "Admin + tools",
    })),
  ]),
  ...quickLinkGroups.flatMap((g) =>
    g.links.map((l) => ({ key: l.url, name: l.name, sub: l.label, url: l.url, accent: l.accent, group: g.title })),
  ),
];
