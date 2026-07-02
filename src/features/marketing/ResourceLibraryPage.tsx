import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  Outro,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { linkToPath, routes } from "../../app/routeMap";
import s from "./ResourceLibraryPage.module.css";

interface Resource {
  cat: string;
  name: string;
  desc: string;
  cost: "free" | "sliding";
  internal: boolean;
  link: string;
  tags: string[];
}

const CATS = [
  { c: "all", label: "All", dot: "var(--plum)" },
  { c: "health", label: "Health", dot: "var(--jade)" },
  { c: "legal", label: "Legal", dot: "var(--accent-ink)" },
  { c: "housing", label: "Housing", dot: "var(--plum)" },
  { c: "money", label: "Money", dot: "var(--jade)" },
  { c: "identity", label: "Identity", dot: "var(--violet)" },
  { c: "safety", label: "Safety", dot: "var(--accent-ink)" },
  { c: "community", label: "Community", dot: "var(--jade)" },
];
const CAT_META: Record<string, { label: string; dot: string }> =
  Object.fromEntries(
    CATS.filter((c) => c.c !== "all").map((c) => [
      c.c,
      { label: c.label, dot: c.dot },
    ]),
  );

const RESOURCES: Resource[] = [
  {
    cat: "health",
    name: "Trans Healthcare Journey Map",
    desc: "Step-by-step guide to HRT via the SNS, private care, legal name change, and surgery access in Portugal.",
    cost: "free",
    internal: true,
    link: routes.transHub,
    tags: ["trans", "HRT", "SNS"],
  },
  {
    cat: "health",
    name: "Harm Reduction Guide",
    desc: "Honest, non-judgmental information about substances, naloxone, and safer clubbing.",
    cost: "free",
    internal: true,
    link: routes.wellbeing,
    tags: ["harm reduction", "naloxone"],
  },
  {
    cat: "health",
    name: "GAT Lisboa",
    desc: "Free HIV and STI testing, naloxone, harm reduction, and trans health services. Walk-in welcome.",
    cost: "free",
    internal: false,
    link: "https://www.gat.org.pt",
    tags: ["HIV", "STI", "trans"],
  },
  {
    cat: "health",
    name: "Checkpoint Lisboa",
    desc: "Rapid HIV/STI testing, PrEP consultations, walk-in appointments. No referral needed.",
    cost: "free",
    internal: false,
    link: "https://checkpointlx.com",
    tags: ["HIV", "PrEP", "testing"],
  },
  {
    cat: "health",
    name: "Mental Health Directory",
    desc: "Queer-affirming therapists and counsellors, including sliding-scale options.",
    cost: "sliding",
    internal: true,
    link: routes.wellbeing,
    tags: ["therapy", "counselling"],
  },
  {
    cat: "legal",
    name: "Hate Crime Reporting Guide",
    desc: "Right now, documenting, PSP reporting, ILGA Portugal, EU mechanisms, and Portuguese law.",
    cost: "free",
    internal: true,
    link: routes.legal,
    tags: ["hate crime", "PSP", "legal"],
  },
  {
    cat: "legal",
    name: "ILGA Portugal",
    desc: "Legal support, hate crime monitoring, advocacy, and community programmes.",
    cost: "free",
    internal: false,
    link: "https://ilga-portugal.pt",
    tags: ["legal", "advocacy"],
  },
  {
    cat: "legal",
    name: "APAV — Victim Support",
    desc: "Free, confidential support for crime victims. 24-hour line: 116 006.",
    cost: "free",
    internal: false,
    link: "https://apav.pt",
    tags: ["victims", "support"],
  },
  {
    cat: "legal",
    name: "Visas & Residency Guide",
    desc: "D7, NHR, digital nomad visa, and residency for LGBTQ+ people in Portugal.",
    cost: "free",
    internal: true,
    link: routes.legal,
    tags: ["visa", "NHR", "D7"],
  },
  {
    cat: "housing",
    name: "Housing Resources",
    desc: "Rights, emergency housing, and queer-friendly landlords in Lisbon.",
    cost: "free",
    internal: true,
    link: routes.housing,
    tags: ["housing", "rights", "emergency"],
  },
  {
    cat: "housing",
    name: "Queer Flatmates",
    desc: "Community-curated flatmate matching — safe, vetted, connected to the network.",
    cost: "free",
    internal: true,
    link: routes.housing,
    tags: ["flatmates", "rooms"],
  },
  {
    cat: "housing",
    name: "Safe Spaces",
    desc: "Physical spaces in Lisbon where you are guaranteed to be safe and welcome.",
    cost: "free",
    internal: true,
    link: routes.safety,
    tags: ["safe space", "community"],
  },
  {
    cat: "money",
    name: "Micro Grants",
    desc: "Small grants (€200–2000) for queer community projects in Lisbon. Transparent allocation.",
    cost: "free",
    internal: true,
    link: routes.grants,
    tags: ["grants", "funding"],
  },
  {
    cat: "money",
    name: "Barter & Skill Exchange",
    desc: "Trade skills instead of money. Design for cooking, coding for legal advice.",
    cost: "free",
    internal: true,
    link: routes.barter,
    tags: ["barter", "skills", "free"],
  },
  {
    cat: "money",
    name: "Gig Workers Portugal",
    desc: "Practical guides to recibos verdes, IRS, and social security for freelancers.",
    cost: "free",
    internal: false,
    link: "#",
    tags: ["freelance", "tax"],
  },
  {
    cat: "identity",
    name: "Trans Hub",
    desc: "Resources, community, and support specifically for trans and non-binary people.",
    cost: "free",
    internal: true,
    link: routes.transHub,
    tags: ["trans", "non-binary"],
  },
  {
    cat: "identity",
    name: "Queer 101",
    desc: "Introductory resource for people exploring their identity or new to the community.",
    cost: "free",
    internal: true,
    link: routes.wellbeing,
    tags: ["identity", "coming out"],
  },
  {
    cat: "identity",
    name: "Family Resources",
    desc: "For queer people navigating family — estrangement, coming out, chosen family.",
    cost: "free",
    internal: true,
    link: routes.wellbeing,
    tags: ["family", "chosen family"],
  },
  {
    cat: "safety",
    name: "Safety & Visibility Guide",
    desc: "How to manage visibility online and offline — for people who need to be careful.",
    cost: "free",
    internal: true,
    link: routes.safety,
    tags: ["safety", "privacy"],
  },
  {
    cat: "safety",
    name: "Report to QueerPulse",
    desc: "Report a member, incident, or safeguarding concern to the platform team.",
    cost: "free",
    internal: true,
    link: routes.governance,
    tags: ["report", "safeguarding"],
  },
  {
    cat: "safety",
    name: "Emergency",
    desc: "Immediate safety resources — crisis lines, emergency housing, urgent support.",
    cost: "free",
    internal: true,
    link: routes.safety,
    tags: ["emergency", "crisis"],
  },
  {
    cat: "community",
    name: "Reading Groups",
    desc: "Small queer book clubs across Lisbon and online — fiction, theory, memoir, poetry.",
    cost: "free",
    internal: true,
    link: routes.communities,
    tags: ["reading", "social"],
  },
  {
    cat: "community",
    name: "Monthly Magazine",
    desc: "Interviews, essays, reviews, and community life — published the first of every month.",
    cost: "free",
    internal: true,
    link: routes.magazine,
    tags: ["magazine", "culture"],
  },
  {
    cat: "community",
    name: "Activism & Organising",
    desc: "Community organising resources, campaigns, and how to get involved in queer activism.",
    cost: "free",
    internal: true,
    link: routes.activism,
    tags: ["activism", "organising"],
  },
  {
    cat: "community",
    name: "Volunteer",
    desc: "Ways to give time to the QueerPulse community and partner organisations.",
    cost: "free",
    internal: true,
    link: routes.volunteer,
    tags: ["volunteer", "giving"],
  },
];

function ResourceCardSkeleton() {
  // Mirrors the real .card: top row (category tag + cost pill), name, two desc lines, tags, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.cardTop}>
        <SkeletonLine width={80} height={12} />
        <SkeletonLine width={48} height={18} style={{ borderRadius: 6 }} />
      </div>
      <SkeletonLine width="70%" height={17} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13} />
        <SkeletonLine width="85%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={s.tags}>
        <SkeletonLine width={50} height={14} />
        <SkeletonLine width={62} height={14} />
      </div>
      <div className={s.cardFoot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
      </div>
    </div>
  );
}

export function ResourceLibraryPage() {
  const loading = useSimulatedLoad();
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (cat !== "all" && r.cat !== cat) return false;
      if (
        q &&
        !(
          r.name.toLowerCase().includes(q) ||
          r.desc.toLowerCase().includes(q) ||
          r.tags.join(" ").toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [cat, query]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Resource Library"
        title={
          <>
            Things that <em>actually help.</em>
          </>
        }
        sub="Community-maintained guides, organisations, contacts, and QueerPulse tools — in one searchable place."
      >
        <div className={s.stats}>
          <div className={s.stat}>
            <b>{RESOURCES.length}</b>
            <span>resources</span>
          </div>
          <div className={s.stat}>
            <b>7</b>
            <span>categories</span>
          </div>
          <div className={s.stat}>
            <b>Community</b>
            <span>maintained</span>
          </div>
        </div>
      </PageHero>

      <div className={s.bar}>
        <div className="wrap">
          <div className={s.barInner}>
            <div className={s.search}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <circle cx={11} cy={11} r={7} />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search resources…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {CATS.map((c) => (
              <button
                type="button"
                key={c.c}
                className={[s.chip, cat === c.c && s.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setCat(c.c)}
              >
                {c.label}
              </button>
            ))}
            <div className={s.count}>{visible.length} results</div>
          </div>
        </div>
      </div>

      <section className={s.body}>
        <div className="wrap">
          <div className={s.grid}>
            {loading &&
              Array.from({ length: 9 }).map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            {!loading && visible.length === 0 && (
              <div className={s.empty}>
                No resources match — try a broader filter.
              </div>
            )}
            {!loading &&
              visible.map((r, i) => {
                const meta = CAT_META[r.cat]!;
                const inner = (
                  <>
                    <div className={s.cardTop}>
                      <span className={s.catTag} style={{ color: meta.dot }}>
                        <span
                          className={s.dot}
                          style={{ background: meta.dot }}
                        />
                        {meta.label}
                      </span>
                      <span
                        className={`${s.cost} ${r.cost === "free" ? s.costFree : s.costSliding}`}
                      >
                        {r.cost === "free" ? "Free" : "Sliding scale"}
                      </span>
                    </div>
                    <div className={s.name}>{r.name}</div>
                    <div className={s.desc}>{r.desc}</div>
                    <div className={s.tags}>
                      {r.tags.map((t) => (
                        <span key={t} className={s.tag}>
                          #{t}
                        </span>
                      ))}
                    </div>
                    <div className={s.cardFoot}>
                      {r.internal ? (
                        "Open guide →"
                      ) : (
                        <span className={s.ext}>Visit site ↗</span>
                      )}
                    </div>
                  </>
                );
                return (
                  <FadeIn
                    key={r.name}
                    delay={Math.min(i, 8) * 60}
                    style={{ height: "100%" }}
                  >
                    {r.internal ? (
                      <Link
                        to={linkToPath(r.link)}
                        className={s.card}
                        style={{ height: "100%" }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <a
                        href={r.link}
                        className={s.card}
                        target="_blank"
                        rel="noreferrer"
                        style={{ height: "100%" }}
                      >
                        {inner}
                      </a>
                    )}
                  </FadeIn>
                );
              })}
          </div>
        </div>
      </section>

      <Outro
        title={
          <>
            Know something <em>missing?</em>
          </>
        }
        sub="Every resource here was added by a community member. If something helped you and isn't listed, tell us."
      >
        <Button
          size="lg"
          href="mailto:hello@queerpulse.pt?subject=Resource suggestion"
        >
          Suggest a resource
        </Button>
      </Outro>
    </PageShell>
  );
}
