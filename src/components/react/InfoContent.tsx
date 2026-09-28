export type InfoPage = "about" | "contact" | "help";
export default function InfoContent({
  page,
  heading = "h2",
}: {
  page: InfoPage;
  heading?: "h1" | "h2";
}) {
  const Heading = heading;
  return (
    <div className="project-content reading">
      <p className="eyebrow">~/{page}</p>
      {page === "about" && (
        <>
          <Heading>Always building something.</Heading>
          <p>
            I'm a freelance dev based in France, obsessed with building things
            and learning new stuff.
          </p>
          <p>
            If an idea gets stuck in my head, I'll probably end up building it.
          </p>
          <p>
            These days, I mostly work with Rust, TypeScript, and Swift. I build
            desktop and terminal tools, web apps with React and Svelte, and
            mobile apps with SwiftUI or React Native and Expo.
          </p>
          <p>
            Currently shipping{" "}
            <a href="https://www.learnfrenchwithdoku.app/">Doku</a>, a French
            learning app with graded stories and a cute cat mascot.
          </p>
          <p>
            I believe in learning by doing, always building something, and
            improving along the way.
          </p>
          <div className="actions">
            <a className="action primary" href="mailto:hello@yannickh.dev">
              Let's work together ↗
            </a>
          </div>
        </>
      )}
      {page === "contact" && (
        <>
          <Heading>Have something in mind?</Heading>
          <p>
            I'm open to freelance opportunities. Tell me what you're building,
            what you need help with, and where you want to take it.
          </p>
          <div className="actions">
            <a className="action primary" href="mailto:hello@yannickh.dev">
              hello@yannickh.dev ↗
            </a>
          </div>
          <p>
            Prefer to look around first? You can find all my public work on{" "}
            <a href="https://github.com/YannickHerrero">GitHub</a>.
          </p>
          <p className="muted">
            Based in France. Building for desktop, mobile and the web.
          </p>
        </>
      )}
      {page === "help" && (
        <>
          <Heading>Make yourself at home.</Heading>
          <p>
            This is a small tiling desktop, inspired by{" "}
            <a href="https://github.com/YannickHerrero/illium">Illium</a>. Every
            action works with a mouse, touch or keyboard.
          </p>
          <dl className="help-list">
            <dt>
              <kbd>Ctrl / ⌘ K</kbd>
            </dt>
            <dd>Open the command palette</dd>
            <dt>
              <kbd>/</kbd>
            </dt>
            <dd>Open commands (outside text fields)</dd>
            <dt>
              <kbd>?</kbd>
            </dt>
            <dd>Open this help window</dd>
            <dt>
              <kbd>Tab</kbd>
            </dt>
            <dd>Move between links and controls</dd>
            <dt>
              <kbd>↑ ↓</kbd> / <kbd>j k</kbd>
            </dt>
            <dd>Move through the project list</dd>
            <dt>
              <kbd>Enter</kbd>
            </dt>
            <dd>Open the selected project or command</dd>
            <dt>
              <kbd>Esc</kbd>
            </dt>
            <dd>Dismiss the command palette</dd>
            <dt>
              <kbd>← →</kbd>
            </dt>
            <dd>Resize a focused window separator</dd>
          </dl>
          <p>
            Use “Alongside” to keep a second project open. Focus, maximize,
            close and resize actions are also available from Commands. The
            window switcher works on small screens.
          </p>
          <p>
            Prefer less transparency? Choose “Use opaque panels” in Commands.
            Your theme and transparency settings are saved on this device when
            storage is available.
          </p>
          <p className="muted">
            The wallpaper is an original illustration. Theme colors follow
            Illium's built-in Catppuccin Mocha and Latte palettes.
          </p>
        </>
      )}
    </div>
  );
}
