import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JLG Core",
    short_name: "JLG Core",
    description: "Private dashboard for the JLG ecosystem.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1e9",
    theme_color: "#f5f1e9",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
