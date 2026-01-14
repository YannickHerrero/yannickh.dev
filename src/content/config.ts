import { defineCollection, z } from "astro:content";

/**
 * Projects collection schema
 * Validates frontmatter of generated project markdown files
 * Note: slug is inferred by Astro from filename, not stored in frontmatter
 */
const projectsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    owner: z.string(),
    repo: z.string(),
    tags: z.array(z.string()),
    stars: z.number(),
    updatedAt: z.string(),
    homepage: z.string().nullable(),
    htmlUrl: z.string().url(),
    defaultBranch: z.string(),
    featured: z.boolean(),
  }),
});

export const collections = {
  projects: projectsCollection,
};
