/**
 * All the words on the site live here. Edit freely.
 * Photos: give each print a `src` (e.g. "/photos/big-sur.jpg" in /public/photos)
 * and it will replace the placeholder gradient.
 */
export const site = {
  name: "Akshay",
  fullName: "Akshay Jagtap",
  tagline: "Senior Software Engineer · Tech Lead",
  headline: ["Precision.", "Patience.", "Position."],
  intro:
    "Seven years building petabyte-scale data platforms and the production LLM agents that run on top of them. Most recently Walmart Global Tech, before that AWS. Building Vezilo after hours. Photographer, traveler, nine-ball on Sundays.",
  email: "akshayjagz@gmail.com",
  /** Leave a href empty and the link is left off the page. */
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/akshaykjagtap" },
    { label: "GitHub", href: "https://github.com/akshayjagz" },
    { label: "Instagram", href: "" }, // TODO: add profile URL
  ],
  footer: "Sunnyvale, California",
};

/**
 * Search settings. `fallbackUrl` is only used when neither NEXT_PUBLIC_SITE_URL nor
 * Vercel's production URL is available, so set your real domain here once you have one.
 */
export const seo = {
  fallbackUrl: "https://akshayjagtap.com",
  jobTitle: "Senior Software Engineer & Tech Lead",
  /** Other spellings people search for. */
  alternateNames: ["Akshay Kacharaj Jagtap", "Akshay K Jagtap", "Akshay"],
  locality: "Sunnyvale",
  region: "CA",
  country: "US",
  /** Kept under ~155 characters so Google shows it whole. */
  description:
    "Akshay Jagtap, senior software engineer and tech lead in Sunnyvale, CA. Seven years building petabyte-scale data platforms and production LLM agents.",
  /** The fuller version, used for structured data and link previews where length is not clipped. */
  longDescription:
    "Akshay Jagtap is a senior software engineer and tech lead in Sunnyvale, California, with seven years building petabyte-scale data platforms and the production LLM agents that run on top of them. Ex-Walmart Global Tech, ex-AWS.",
  /** Used for the meta keywords tag and to steer the copy. Google ignores the tag; the words matter on the page. */
  keywords: [
    "Akshay Jagtap",
    "Akshay Kacharaj Jagtap",
    "Akshay Jagtap portfolio",
    "Akshay Jagtap software engineer",
    "senior software engineer portfolio",
    "tech lead portfolio",
    "data engineer portfolio",
    "AI engineer portfolio",
    "LLM agents",
    "retrieval augmented generation",
    "RAG pipelines",
    "Apache Spark",
    "Apache Iceberg",
    "data platform engineer",
    "Sunnyvale software engineer",
    "Bay Area tech lead",
    "creative portfolio website",
    "interactive portfolio",
    "playable portfolio",
    "snooker portfolio website",
  ],
};

export const experience = {
  title: "Five",
  titleAccent: "shots.",
  sub: "Seven years, newest first. Keep scrolling, each role pots a ball, ending on the black.",
};

export type Role = {
  years: string;
  role: string;
  title: string;
  body: string;
  tags: string[];
  /** ball colour potted for this role in the experience section */
  ball: string;
};

/** Newest first. Each role is one "shot", and the last one pots the black. */
export const roles: Role[] = [
  {
    years: "2025 — 2026",
    role: "Tech Lead · Walmart Global Tech",
    title: "LLM agents in production",
    body: "Two agents shipped on top of the platform: a triage agent that reads on-call tickets, retrieves similar resolutions and runbooks, and safely closes the ~30% that never needed an engineer, and a sprint-report agent leadership reads every week. Before either touched real data I built the RBAC layer that made pointing a model at production safe. The model drafts, the code decides.",
    tags: ["Python", "RAG", "Milvus", "Evaluation harnesses", "MCP"],
    ball: "#c9313d",
  },
  {
    years: "2024 — 2025",
    role: "Tech Lead · Walmart Global Tech",
    title: "The identifier migration",
    body: "Led the deprecation of a legacy customer identifier across petabyte-scale datasets and three partner teams over four quarters, with zero data-quality regressions. Risk-scored sequencing, shadow-mode parity validation at every stage, four engineers on independent tracks, two of them mentored to promotion.",
    tags: ["Technical leadership", "Spark", "Scala", "Data contracts"],
    ball: "#e9c33d",
  },
  {
    years: "2023 — 2024",
    role: "Senior Software Engineer · Walmart Global Tech",
    title: "Hive to Iceberg, without a big bang",
    body: "Architected the petabyte-scale table format migration: parallel tables with dual-write, hidden partitioning, consumer-by-consumer cutover with rollback until the last team moved. 64% runtime reduction, and schema evolution unblocked downstream. Alongside it, $100K a month of cloud compute removed, then another 15% with serverless Spark.",
    tags: ["Apache Iceberg", "Spark", "Hive", "GCP Dataproc"],
    ball: "#1d7a3d",
  },
  {
    years: "2021 — 2023",
    role: "Senior Software Engineer · Walmart Global Tech",
    title: "A petabyte-scale signals platform",
    body: "Owned the Scala and Spark pipeline that turns billions of search, cart and purchase signals into the datasets three consumer teams run ad targeting, audience segmentation and ML measurement on. Re-architected the critical batch jobs for a 90% runtime cut and moved three high-traffic Ads APIs to async flows for 67% lower p95.",
    tags: ["Scala", "Spark", "Kafka", "Airflow", "BigQuery"],
    ball: "#2b5aa6",
  },
  {
    years: "2020 — 2021",
    role: "Software Development Engineer · AWS",
    title: "Billing you cannot get wrong",
    body: "Event-driven Java services on Lambda, Step Functions and DynamoDB processing enterprise billing data, plus a validation library other teams adopted to stop invalid account relationships reaching invoices. Idempotent consumers everywhere: you cannot process money one and a half times.",
    tags: ["Java", "Lambda", "Step Functions", "DynamoDB", "SQS/SNS"],
    ball: "#0f0f10",
  },
];

export const toolkit = {
  title: "The",
  titleAccent: "toolkit.",
  sub: "Two tracks that keep feeding each other: the platform underneath, the AI on top.",
  groups: [
    { group: "AI & LLM engineering", items: ["LLM agents", "RAG pipelines", "MCP", "Milvus", "Embeddings", "Prompt versioning", "Shadow-mode evals", "Hit@k", "Grounding & citations"] },
    { group: "Data", items: ["Spark", "PySpark", "Kafka", "Apache Iceberg", "Hive", "Airflow", "BigQuery", "Hadoop"] },
    { group: "Distributed systems", items: ["Event-driven microservices", "Async REST APIs", "RBAC & multi-tenancy", "Data contracts", "Idempotency", "Observability"] },
    { group: "Languages & cloud", items: ["Python", "Scala", "Java", "SQL", "AWS", "GCP", "Docker", "Jenkins", "CI/CD"] },
  ],
  footnote:
    "Walmart Bravo Award for infrastructure, cloud cost and Spark performance work · two internal tech talks, one on agents for engineering workflow automation and one on cutting 73 minutes from CI/CD · Google Cloud MLOps for Generative AI badge.",
};

export const vezilo = {
  kicker: "Personal project · in progress",
  title: "Vezilo. Being built",
  titleAccent: "after hours.",
  body: "My own app: product, mobile and backend, all of it mine. Still very much on the table, and the place I get to be unreasonable about details. More to share once it is ready to be seen.",
  /** Leave empty while it is a work in progress; a quiet status chip shows instead of a button. */
  cta: "",
  href: "",
  status: "Work in progress · details soon",
};

export type Print = { title: string; year: string; src?: string; gradient: string; tilt: number };

export const prints: Print[] = [
  { title: "Joshua Tree", year: "2025", gradient: "linear-gradient(200deg,#f2c078,#c8563f 50%,#2a1830)", tilt: -2 },
  { title: "Big Sur", year: "2024", gradient: "linear-gradient(180deg,#0f2f4a,#3f8ea3 55%,#d6ecec)", tilt: 1.5 },
  { title: "Tokyo", year: "2023", gradient: "linear-gradient(160deg,#1a1a1a,#5b5148 60%,#e6dccb)", tilt: -1 },
  { title: "Lisbon", year: "2024", gradient: "linear-gradient(210deg,#f9c78b,#c5566e 55%,#33203f)", tilt: 2 },
  { title: "Yosemite", year: "2023", gradient: "linear-gradient(180deg,#2f3d35,#8a9a7b 60%,#e5e2d3)", tilt: -1.5 },
  { title: "Marrakech", year: "2024", gradient: "linear-gradient(160deg,#f5e7c8,#c48a55 55%,#3f2a1c)", tilt: 1 },
];

export const lounge = [
  { title: "Nine-ball", body: "In a league now, playing every Sunday. Position play is planning three shots ahead, which is most of the day job too.", big: "Sun" },
  { title: "Travel", body: "Long drives and long weekends across the US, cities in India, and one very good week in Mexico. Camera always in the bag.", big: "On the road", small: true },
  { title: "California", body: "Sunnyvale is home base. Coast on Saturday, league on Sunday, and the table is always open for the next frame, wherever it is.", big: "Open frame", small: true },
];

export const contact = {
  title: "Fancy a",
  titleAccent: "frame?",
  lead: "The table is always open. Sunnyvale by default, happy to play anywhere in the US, and always up for a conversation about real engineering at real scale.",
};
