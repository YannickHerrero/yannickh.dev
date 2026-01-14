import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Fuse from "fuse.js";
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

// Get card size variant based on index for visual variety
function getCardVariant(
  index: number,
  isFeatured: boolean
): "hero" | "standard" | "tall" {
  if (isFeatured && index === 0) return "hero";
  // Create visual variety: every 3rd card after the first row is tall
  const adjustedIndex = isFeatured ? index - 1 : index;
  if (
    adjustedIndex >= 0 &&
    (adjustedIndex % 5 === 1 || adjustedIndex % 5 === 3)
  ) {
    return "tall";
  }
  return "standard";
}

export default function ProjectCatalog({ projects }: ProjectCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  // Listen to header search input
  useEffect(() => {
    const headerSearch = document.getElementById(
      "header-search"
    ) as HTMLInputElement | null;
    if (headerSearch) {
      const handleInput = (e: Event) => {
        setSearchQuery((e.target as HTMLInputElement).value);
      };
      headerSearch.addEventListener("input", handleInput);
      return () => headerSearch.removeEventListener("input", handleInput);
    }
    return undefined;
  }, []);

  // Mouse tracking for card glow effect
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const cards = gridRef.current?.querySelectorAll(".bento-card");
    cards?.forEach((card) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
      (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
    });
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener("mousemove", handleMouseMove);
      return () => grid.removeEventListener("mousemove", handleMouseMove);
    }
    return undefined;
  }, [handleMouseMove]);

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
    const headerSearch = document.getElementById(
      "header-search"
    ) as HTMLInputElement | null;
    if (headerSearch) {
      headerSearch.value = "";
    }
  };

  // Separate featured project from others for the hero card
  const featuredProject = filteredProjects.find((p) => p.featured);
  const otherProjects = filteredProjects.filter(
    (p) => !p.featured || p !== featuredProject
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex max-w-3xl flex-col gap-4">
          {/* Subtitle */}
          <p className="text-lg font-medium text-[#EBEBF5]">
            {projects.length} Projects{" "}
            <span className="text-accent">Collection</span>
          </p>
          {/* Main Title */}
          <h1 className="text-4xl font-bold leading-tight text-accent sm:text-5xl lg:text-6xl">
            Project Catalog
          </h1>
          {/* Description */}
          <p className="max-w-2xl text-lg leading-relaxed text-[#EBEBF5] sm:text-xl">
            A curated collection of open source projects. Discover tools,
            libraries, and applications built with modern technologies.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      {filteredProjects.length > 0 ? (
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Featured Project Card - spans 2 columns */}
          {featuredProject && (
            <a
              key={featuredProject.slug}
              href={`/project/${featuredProject.slug}`}
              className="bento-card bento-featured bento-standard group relative flex flex-col p-6 sm:col-span-2"
            >
              {/* Content */}
              <div className="relative z-10 flex flex-1 flex-col gap-4">
                {/* Title */}
                <h3 className="text-3xl font-bold text-accent sm:text-4xl">
                  {featuredProject.title}
                </h3>
                {/* Description */}
                {featuredProject.description && (
                  <p className="line-clamp-3 max-w-xl text-lg leading-relaxed text-[#EBEBF5]">
                    {featuredProject.description}
                  </p>
                )}
                {/* Tags */}
                {featuredProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {featuredProject.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                    {featuredProject.tags.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs text-white/40">
                        +{featuredProject.tags.length - 5} more
                      </span>
                    )}
                  </div>
                )}
                {/* Meta info */}
                <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-white/40">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {formatStars(featuredProject.stars)}
                  </span>
                  <span className="font-mono text-xs">
                    {featuredProject.owner}/{featuredProject.repo}
                  </span>
                </div>
              </div>
            </a>
          )}

          {/* Other Project Cards */}
          {otherProjects.map((project, index) => {
            const variant = getCardVariant(index, !!featuredProject);
            const isTall = variant === "tall";
            const maxTags = isTall ? 4 : 3;

            return (
              <a
                key={project.slug}
                href={`/project/${project.slug}`}
                className={`bento-card group relative flex flex-col p-6 ${
                  isTall ? "bento-tall" : "bento-standard"
                }`}
              >
                {/* Content */}
                <div className="relative z-10 flex flex-1 flex-col gap-3">
                  {/* Title */}
                  <h3
                    className={`font-bold text-accent ${isTall ? "text-3xl" : "text-2xl"}`}
                  >
                    {project.title}
                  </h3>
                  {/* Description */}
                  {project.description && (
                    <p
                      className={`leading-relaxed text-[#EBEBF5] ${isTall ? "line-clamp-4 text-lg" : "line-clamp-3 text-base"}`}
                    >
                      {project.description}
                    </p>
                  )}
                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, maxTags).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > maxTags && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs text-white/40">
                          +{project.tags.length - maxTags}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Meta info */}
                  <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-white/40">
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
                    <span className="truncate font-mono text-xs">
                      {project.owner}/{project.repo}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="bento-card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <svg
              className="h-6 w-6 text-white/30"
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
          <h3 className="mt-4 text-lg font-medium text-white">
            No projects found
          </h3>
          <p className="mt-2 text-sm text-white/40">
            Try adjusting your search query.
          </p>
          <button
            onClick={clearSearch}
            className="mt-4 text-sm text-white/50 transition-colors hover:text-white"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
