import { lounge } from "@/lib/content";

export default function Lounge() {
  return (
    <section id="lounge" className="wrap">
      <div className="sec-head" data-reveal>
        <h2>The <em>lounge.</em></h2>
        <p>Where the rest of the week happens.</p>
      </div>
      <div className="grid3">
        {lounge.map((t) => (
          <div className="tile" key={t.title} data-reveal data-hover>
            <div><h3>{t.title}</h3><p>{t.body}</p></div>
            <div className={`n${t.small ? " small" : ""}`}>{t.big}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
