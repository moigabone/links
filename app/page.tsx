import { LINKS } from "@/lib/links";

export default function Home() {
  return (
    <main className="links">
      <p className="eyebrow">Carnet de liens</p>
      <h1 className="title">Gabin Clavier</h1>
      <nav className="link-list">
        {LINKS.map((link) => (
          <a
            key={link.href}
            className={link.accent === "neon" ? "link link--neon" : "link"}
            href={link.href}
          >
            <span className="link-body">
              <span className="link-name">{link.name}</span>
              <span className="link-url">{new URL(link.href).host}</span>
              {link.description && <span className="link-desc">{link.description}</span>}
            </span>
            <span className="link-arrow" aria-hidden="true">
              →
            </span>
          </a>
        ))}
      </nav>
    </main>
  );
}
