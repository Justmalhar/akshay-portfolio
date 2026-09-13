"use client";
import { site, contact } from "@/lib/content";

export default function Contact() {
  const links = site.links.filter((l) => l.href);
  const rerack = () => {
    window.dispatchEvent(new CustomEvent("portfolio:rerack"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", " ");
  };
  return (
    <section id="contact" className="wrap contact">
      <div className="rerack" aria-hidden="true">Re-racked · your break</div>
      <h2>{contact.title} <em>{contact.titleAccent}</em></h2>
      <p className="lead">{contact.lead}</p>
      <div className="cta">
        <a className="btn mail" href={`mailto:${site.email}`} data-magnetic><span className="ball" style={{ background: "var(--black)" }} /> {site.email}</a>
        {links.map((l) => (
          <a className="btn ghost" key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" data-magnetic>{l.label}</a>
        ))}
      </div>
      <div className="again">
        <span>End of the frame</span>
        <button className="btn ghost" onClick={rerack} data-magnetic id="rerack"><span className="ball" style={{ background: "var(--yellow)" }} /> Re-rack · back to the top</button>
      </div>
    </section>
  );
}
