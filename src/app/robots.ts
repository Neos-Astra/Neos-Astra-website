import type { MetadataRoute } from "next";

/**
 * Programmatic robots.txt for Neos Astra.
 * Next.js will serve this at /robots.txt automatically.
 *
 * Rules:
 * - Public pages: allow all crawlers
 * - Admin/SuperAdmin: block all crawlers (auth-protected anyway)
 * - API routes: block crawlers (no indexable content)
 * - Next.js internals: block crawlers
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses", "/about", "/team", "/events", "/career", "/faq", "/privacy"],
        disallow: [
          "/admin/",
          "/superadmin/",
          "/api/",
          "/_next/",
          "/form/", // Survey form — not meant to be indexed
        ],
      },
    ],
    sitemap: "https://neosastra.com/sitemap.xml",
    host: "https://neosastra.com",
  };
}
