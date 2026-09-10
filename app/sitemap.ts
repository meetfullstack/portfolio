import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { projects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projectRoutes,
  ];
}
