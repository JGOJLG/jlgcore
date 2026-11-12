import type { MetadataRoute } from "next";

// JLG Core is a private dashboard — keep it out of search engines.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
