import type { PortfolioProject } from "../../data/portfolio";

export default function ProjectContent({
  project,
  heading = "h2",
}: {
  project: PortfolioProject;
  heading?: "h1" | "h2";
}) {
  const Heading = heading;
  return (
    <div className="project-content">
      <p className="eyebrow">{project.category}</p>
      <Heading>{project.name}</Heading>
      <p className="project-summary">{project.summary}</p>
      <div className="tags">
        {project.stack.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      {project.image && (
        <figure className={`project-figure ${project.imageShape ?? ""}`}>
          <img
            src={project.image}
            alt={project.imageAlt ?? project.name}
            loading="lazy"
            decoding="async"
          />
        </figure>
      )}
      <p className="project-story">{project.story}</p>
      <h3 className="eyebrow">Inside the project</h3>
      <ul className="project-highlights">
        {project.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="actions">
        {project.repo && (
          <a
            className="action primary"
            href={project.repo}
            target="_blank"
            rel="noreferrer"
          >
            View source ↗<span className="sr-only"> (opens in new tab)</span>
          </a>
        )}
        {project.website && (
          <a
            className={`action ${!project.repo ? "primary" : ""}`}
            href={project.website}
            target="_blank"
            rel="noreferrer"
          >
            Visit website ↗<span className="sr-only"> (opens in new tab)</span>
          </a>
        )}
        <a className="action" href={`/work/${project.id}`}>
          Permalink ↗
        </a>
      </div>
      <div className="project-meta">
        <span>{project.status}</span>
        <span>Built by Yannick Herrero</span>
      </div>
    </div>
  );
}
