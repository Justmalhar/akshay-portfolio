import { toolkit } from "@/lib/content";

export default function Toolkit() {
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
      <p className="kitNote" data-reveal>{toolkit.footnote}</p>
    </section>
  );
}
