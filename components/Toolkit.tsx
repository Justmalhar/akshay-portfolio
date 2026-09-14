import { toolkit } from "@/lib/content";

const icons = {
  trophy: (
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Zm10 1h2.4a1.6 1.6 0 0 1 0 5.2H17M7 5H4.6a1.6 1.6 0 0 0 0 5.2H7m5 3.8V18m-4 3h8" />
  ),
  talk: (
    <path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Zm7 8a7 7 0 0 1-14 0m7 7v3m-3.5 0h7" />
  ),
  badge: (
    <path d="M12 3a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm-3.4 11L7.5 21l4.5-2.4L16.5 21l-1.1-7M12 6.6l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4L8.5 9.1l2.4-.3L12 6.6Z" />
  ),
};

/** A small trophy case: awards, talks and certifications, kept apart from the skill grid. */
function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

export default function Toolkit() {
  const { recognition } = toolkit;
  return (
    <section id="toolkit" className="wrap">
      <div className="sec-head" data-reveal>
        <h2>{toolkit.title} <em>{toolkit.titleAccent}</em></h2>
        <p>{toolkit.sub}</p>
      </div>
      <div className="kit">
        {toolkit.groups.map((g) => (
          <div className="kitGroup" key={g.group} data-reveal>
            <h3>{g.group}</h3>
            <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <aside className="recog" data-reveal aria-label={recognition.title}>
        <h3 className="recogHead"><Icon name="trophy" /> {recognition.title}</h3>
        <ul>
          {recognition.items.map((r) => (
            <li key={r.text}><Icon name={r.icon} /><span>{r.text}</span></li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
