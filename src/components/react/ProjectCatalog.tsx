import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { FadeIn, FadeInStagger } from "./FadeIn";
import type { Project } from "../../types";

interface ProjectCatalogProps {
  projects: Project[];
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.getFullYear().toString();
}

export default function ProjectCatalog({ projects }: ProjectCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: [
          { name: "title", weight: 2 },
          { name: "description", weight: 1.5 },
          { name: "tags", weight: 1 },
          { name: "owner", weight: 0.5 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [projects]
  );

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let results = projects;

    // Apply fuzzy search
    if (searchQuery.trim()) {
      results = fuse.search(searchQuery).map((r) => r.item);
    }

    // Sort results - featured first, then by stars descending
    results = [...results].sort((a, b) => {
      // Featured always first
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      // Then by stars descending
      return b.stars - a.stars;
    });

    return results;
  }, [projects, searchQuery, fuse]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div>
      {/* Search bar - only show if there are projects */}
      {projects.length > 3 && (
        <div className="mb-12">
          <div className="relative max-w-md">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="input pl-12"
            />
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <FadeIn key={project.slug} className="flex">
              <article className="project-card">
                {/* Project icon/initial */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-950 dark:bg-white">
                  <span className="text-2xl font-semibold text-white dark:text-neutral-950">
                    {project.title.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Date and type */}
                <p className="mt-6 flex gap-x-2 text-sm text-neutral-950 dark:text-white">
                  <time dateTime={project.updatedAt} className="font-semibold">
                    {formatDate(project.updatedAt)}
                  </time>
                  <span
                    className="text-neutral-300 dark:text-neutral-600"
                    aria-hidden="true"
                  >
                    /
                  </span>
                  <span>{project.featured ? "Featured" : "Project"}</span>
                </p>

                {/* Title */}
                <h3 className="mt-6 font-display text-2xl font-semibold text-neutral-950 dark:text-white">
                  <a href={`/project/${project.slug}`}>
                    <span className="absolute inset-0 rounded-3xl" />
                    {project.title}
                  </a>
                </h3>

                {/* Description */}
                {project.description && (
                  <p className="mt-4 line-clamp-3 text-base text-neutral-600 dark:text-neutral-400">
                    {project.description}
                  </p>
                )}

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="text-sm text-neutral-500">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 flex items-center gap-4 text-sm text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {formatStars(project.stars)}
                  </span>
                  <span className="font-mono text-xs text-neutral-400">
                    {project.owner}/{project.repo}
                  </span>
                </div>
              </article>
            </FadeIn>
          ))}
        </FadeInStagger>
      ) : (
        <FadeIn>
          <div className="flex flex-col items-center justify-center rounded-3xl bg-neutral-50 py-16 text-center dark:bg-neutral-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
              <svg
                className="h-6 w-6 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-neutral-950 dark:text-white">
              No projects found
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Try adjusting your search query.
            </p>
            <button onClick={clearSearch} className="btn btn-secondary mt-4">
              Clear search
            </button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
