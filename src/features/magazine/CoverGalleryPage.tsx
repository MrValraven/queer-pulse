import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./CoverGalleryPage.module.css";

const ISSUE = routes.issue;
const MEMBER = routes.members;
const PRESS = routes.pressKit;

type Tint = "a" | "b" | "c" | "d" | "e";
interface Cover {
  tint: Tint;
  title: React.ReactNode;
  meta: string;
  num: string;
}
const COVERS: Cover[] = [
  { tint: "d", title: <>On <em>health.</em></>, meta: "Spring · Jun 2026 · 84pp", num: "09" },
  { tint: "b", title: <>On <em>work.</em></>, meta: "Winter · Mar 2026 · 72pp", num: "08" },
  { tint: "c", title: <>On <em>inheritance.</em></>, meta: "Autumn · Dec 2025 · 68pp", num: "07" },
  { tint: "a", title: <>On <em>the city.</em></>, meta: "Summer · Sep 2025 · 80pp", num: "06" },
  { tint: "e", title: <>On <em>migration.</em></>, meta: "Spring · Jun 2025 · 76pp", num: "05" },
  { tint: "b", title: <>On <em>the body.</em></>, meta: "Winter · Mar 2025 · 64pp", num: "04" },
  { tint: "c", title: <>On <em>belonging.</em></>, meta: "Autumn · Dec 2024 · 60pp", num: "03" },
  { tint: "d", title: <>On <em>time.</em></>, meta: "Summer · Sep 2024 · 56pp", num: "02" },
  { tint: "a", title: <>On <em>beginning.</em></>, meta: "Inaugural · Jun 2024 · 48pp", num: "01" },
];
const TINT_CLASS: Record<Tint, string> = { a: "tintA", b: "tintB", c: "tintC", d: "tintD", e: "tintE" };

const STATS = [
  { n: <em>9</em>, l: "Covers · one per quarter since launch" },
  { n: "8", l: "Different cover artists" },
  { n: <em>~620</em>, l: "Avg pages printed per issue" },
  { n: "Riso", l: "Printed at Editora Anjos · 3 colours max" },
];

const ILLUS: { initials: string; jade?: boolean; plum?: boolean; name: string; covers: React.ReactNode }[] = [
  { initials: "AB", name: "André Bento", covers: <>Covers <b>09 · 05</b></> },
  { initials: "TC", jade: true, name: "Tó Cunha", covers: <>Covers <b>08 · 02</b></> },
  { initials: "FL", name: "Filipa Lopes", covers: <>Cover <b>07</b></> },
  { initials: "MR", plum: true, name: "Marta Reis", covers: <>Cover <b>06</b></> },
  { initials: "SC", jade: true, name: "Sofia Castaño", covers: <>Cover <b>05</b></> },
  { initials: "AK", name: "Anika Kovač", covers: <>Cover <b>04</b></> },
  { initials: "CV", plum: true, name: "Catarina Vaz", covers: <>Cover <b>03</b></> },
  { initials: "8×", name: "Founders (group)", covers: <>Cover <b>01</b> · inaugural</> },
];

export function CoverGalleryPage() {
  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Magazine · all covers · 2024 → present</div>
            <h1 className={styles.h1}>
              Nine <em>covers,</em> one each season.
            </h1>
            <p className={styles.dek}>
              Every QueerPulse Magazine cover, in order. Risograph-printed in Lisbon,
              sized A5. Each was made by a different artist working with the editorial
              team. <em>Press is welcome to use any of these images</em> under the
              terms in our <Link to={PRESS}>press kit</Link>.
            </p>
          </div>
        </section>

        <div className={styles.grid}>
          {COVERS.map((c) => (
            <Link to={ISSUE} className={styles.tile} key={c.num}>
              <div className={`${styles.img} ${styles[TINT_CLASS[c.tint]]}`}>
                <div className={styles.num}>
                  №<em>{c.num}</em>
                </div>
              </div>
              <div className={styles.tileInfo}>
                <div className="left">
                  <b>{c.title}</b>
                  <span>{c.meta}</span>
                </div>
                <div className="right">
                  №<em>{c.num}</em>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className={styles.stats}>
          <div className={styles.statsInner}>
            {STATS.map((s, i) => (
              <div className={styles.cgs} key={i}>
                <b>{s.n}</b>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.illus}>
          <h2>
            Made <em>with</em>
          </h2>
          <p className={styles.sub}>
            Cover artists, in cover order. Most are members; two we commissioned
            externally.
          </p>
          <div className={styles.illusGrid}>
            {ILLUS.map((il) => (
              <Link to={MEMBER} className={styles.illusCard} key={il.name}>
                <div
                  className={[
                    styles.illusAv,
                    il.jade && styles.illusAvJade,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={il.plum ? { background: "rgba(45,27,61,.10)", color: "var(--plum)" } : undefined}
                >
                  {il.initials}
                </div>
                <div className={styles.illusName}>{il.name}</div>
                <div className={styles.illusMeta}>{il.covers}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
