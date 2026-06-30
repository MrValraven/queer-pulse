import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import styles from "./PressArchivePage.module.css";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";

interface Piece {
  day: string;
  month: string;
  kind: string;
  pin?: boolean;
  source: React.ReactNode;
  sourceMuted?: boolean;
  sourceKind: string;
  title: React.ReactNode;
  meta: React.ReactNode;
  out: string;
}
interface YearGroup {
  year: string;
  count: string;
  pieces: Piece[];
}

const DATA: YearGroup[] = [
  {
    year: "2026",
    count: "14 pieces",
    pieces: [
      {
        day: "04",
        month: "Mar",
        kind: "Long-form",
        pin: true,
        source: "Público",
        sourceKind: "feature",
        title: (
          <>
            "Em Lisboa, uma rede profissional <em>queer e independente</em>."
          </>
        ),
        meta: (
          <>
            By Ana Sá Lopes · 6,400 words · <b>PT</b>
          </>
        ),
        out: "publico.pt",
      },
      {
        day: "18",
        month: "Feb",
        kind: "Interview",
        source: "Vice Portugal",
        sourceKind: "interview",
        title: (
          <>
            The platform that <em>refuses to scale.</em>
          </>
        ),
        meta: (
          <>
            Interview with Marta Reis · 22 min read · <b>PT/EN</b>
          </>
        ),
        out: "vice.com/pt",
      },
      {
        day: "24",
        month: "Jan",
        kind: "Feature",
        pin: true,
        source: "FT Weekend",
        sourceKind: "feature",
        title: <>Inside Lisbon's quietest queer institution.</>,
        meta: (
          <>
            Long-form magazine piece · syndicated to FT.com · <b>EN</b>
          </>
        ),
        out: "ft.com",
      },
      {
        day: "10",
        month: "Jan",
        kind: "News",
        source: "Observador",
        sourceKind: "news",
        title: <>QueerPulse anuncia abertura no Porto em Agosto.</>,
        meta: (
          <>
            By Maria Caetano · 800 words · <b>PT</b>
          </>
        ),
        out: "observador.pt",
      },
    ],
  },
  {
    year: "2025",
    count: "26 pieces",
    pieces: [
      {
        day: "11",
        month: "Nov",
        kind: "Local",
        source: "Mensagem de Lisboa",
        sourceKind: "feature",
        title: (
          <>
            A Câmara dos <em>Anjos.</em>
          </>
        ),
        meta: (
          <>
            Local-press feature on the neighbourhood · <b>PT</b>
          </>
        ),
        out: "amensagem.pt",
      },
      {
        day: "22",
        month: "Sep",
        kind: "Critique",
        sourceMuted: true,
        source: "Diário de Notícias",
        sourceKind: "op-ed",
        title: <>"A invite-only network · who's left out?"</>,
        meta: (
          <>
            Critical op-ed by António Marreiros · we replied publicly ·{" "}
            <b>PT</b>
          </>
        ),
        out: "dn.pt",
      },
      {
        day: "14",
        month: "Jul",
        kind: "Interview",
        source: "Antena 1 · podcast",
        sourceKind: "radio interview",
        title: <>"A nossa entrevista do dia · Catarina Vaz."</>,
        meta: (
          <>
            38 min radio interview · <b>PT</b> · transcript published
          </>
        ),
        out: "rtp.pt",
      },
      {
        day: "28",
        month: "Apr",
        kind: "News",
        source: "Gay Star News",
        sourceKind: "news",
        title: <>Lisbon's QueerPulse hits 1,500 members.</>,
        meta: (
          <>
            Short news piece · <b>EN</b>
          </>
        ),
        out: "gaystarnews.com",
      },
      {
        day: "03",
        month: "Mar",
        kind: "Profile",
        source: "Wired UK",
        sourceKind: "profile",
        title: <>The slow social network.</>,
        meta: (
          <>
            By Caitlin Welsh · 4,200 words · <b>EN</b>
          </>
        ),
        out: "wired.co.uk",
      },
    ],
  },
  {
    year: "2024",
    count: "14 pieces · launch year",
    pieces: [
      {
        day: "12",
        month: "Dec",
        kind: "Annual",
        source: "Are.na Annual",
        sourceKind: "editor's pick",
        title: <>The 12 platforms we wished existed in 2024.</>,
        meta: (
          <>
            Editor's pick · positioned #4 · <b>EN</b>
          </>
        ),
        out: "are.na",
      },
      {
        day: "04",
        month: "Oct",
        kind: "Profile",
        source: "Le Monde · M Magazine",
        sourceKind: "profile",
        title: <>"Le réseau social qui ne veut pas grandir."</>,
        meta: (
          <>
            3,800 words · <b>FR</b>
          </>
        ),
        out: "lemonde.fr",
      },
      {
        day: "21",
        month: "Jul",
        kind: "News",
        source: "Público",
        sourceKind: "launch coverage",
        title: (
          <>"QueerPulse · uma nova rede para profissionais LGBTI+ em Lisboa."</>
        ),
        meta: (
          <>
            By Ana Sá Lopes · 1,200 words · <b>PT</b>
          </>
        ),
        out: "publico.pt",
      },
    ],
  },
];

const CHIPS = [
  "All · 54",
  "Features · 22",
  "Interviews · 12",
  "News · 14",
  "Critiques · 6",
];

/** A deterministic "older archive" generated from the curated pieces, so
 *  "Load more" appends real rows instead of toasting into the void. */
const OLDER: YearGroup[] = [
  {
    year: "2023",
    count: "18 pieces",
    pieces: Array.from({ length: 5 }, (_, i) => {
      const base = DATA[1]!.pieces[i % DATA[1]!.pieces.length]!;
      return {
        ...base,
        pin: false,
        sourceKind: `${base.sourceKind} · archive`,
      };
    }),
  },
  {
    year: "2022",
    count: "18 pieces",
    pieces: Array.from({ length: 5 }, (_, i) => {
      const base = DATA[2]!.pieces[i % DATA[2]!.pieces.length]!;
      return {
        ...base,
        pin: false,
        sourceKind: `${base.sourceKind} · archive`,
      };
    }),
  },
];

function PressRowSkeleton() {
  // Mirrors the real .row grid: date column (auto), title block (1fr), outlet (auto).
  return (
    <div className={styles.row} aria-hidden>
      <div className={styles.date}>
        <SkeletonLine width={56} height={17} />
        <SkeletonLine width={44} height={11} style={{ marginTop: 6 }} />
      </div>
      <div>
        <SkeletonLine width={120} height={11} />
        <SkeletonLine width="70%" height={18} style={{ marginTop: 8 }} />
        <SkeletonLine width="45%" height={12} style={{ marginTop: 6 }} />
      </div>
      <SkeletonLine width={72} height={12} />
    </div>
  );
}

export function PressArchivePage() {
  const loading = useSimulatedLoad();
  const { showToast } = useToast();
  const [chip, setChip] = useState(0);
  const [extra, setExtra] = useState<YearGroup[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    if (loadingMore || extra.length >= OLDER.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setExtra((prev) => [...prev, OLDER[prev.length]!]);
      setLoadingMore(false);
    }, 700);
  };
  const allLoaded = extra.length >= OLDER.length;

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <div className={styles.eye}>Coverage archive · since 2024</div>
            <h1 className={styles.h1}>
              Everything written <em>about us.</em>
            </h1>
            <p className={styles.sub}>
              Pieces about QueerPulse in third-party publications, indexed by
              year. <em>Includes critiques we disagreed with.</em>
            </p>
          </div>
          <div className={styles.stats}>
            <span>
              <b>
                <em>54</em>
              </b>
              Pieces all-time
            </span>
            <span>
              <b>6</b>Languages
            </span>
            <span>
              <b>
                <em>14</em>
              </b>
              This year
            </span>
          </div>
        </header>

        <div className={styles.controls}>
          <div className={styles.search}>
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search title, source, author" />
          </div>
          {CHIPS.map((c, i) => (
            <button
              key={c}
              type="button"
              className={[styles.chip, chip === i && styles.chipActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setChip(i)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div>
            <h2 className={styles.year} aria-hidden>
              <SkeletonLine width={90} height={42} />
            </h2>
            {Array.from({ length: 5 }).map((_, i) => (
              <PressRowSkeleton key={i} />
            ))}
          </div>
        ) : (
          [...DATA, ...extra].map((yg) => (
            <div key={yg.year}>
              <h2 className={styles.year}>
                202<em>{yg.year.slice(3)}</em>
                <span className={styles.ct}>{yg.count}</span>
              </h2>
              {yg.pieces.map((p, i) => (
                <FadeIn key={i} delay={Math.min(i, 8) * 60}>
                  <a
                    href="#"
                    className={styles.row}
                    onClick={(e) => {
                      e.preventDefault();
                      showToast(`Opening on ${p.out}…`, "info");
                    }}
                  >
                    <div className={styles.date}>
                      {p.day} <em>{p.month}</em>
                      <span>{p.kind}</span>
                    </div>
                    <div>
                      <div
                        className={styles.source}
                        style={
                          p.sourceMuted ? { color: "var(--ink-60)" } : undefined
                        }
                      >
                        {p.pin && <span className={styles.pin}>Featured</span>}
                        {p.source}
                        <span className={styles.kind}>· {p.sourceKind}</span>
                      </div>
                      <div className={styles.title}>{p.title}</div>
                      <div className={styles.meta}>{p.meta}</div>
                    </div>
                    <div className={styles.out}>{p.out}</div>
                  </a>
                </FadeIn>
              ))}
            </div>
          ))
        )}

        {loadingMore && (
          <div>
            <h2 className={styles.year} aria-hidden>
              <SkeletonLine width={90} height={42} />
            </h2>
            {Array.from({ length: 5 }).map((_, i) => (
              <PressRowSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !allLoaded && (
          <div className={styles.loadMore}>
            <Button
              type="button"
              variant="ghost"
              onClick={loadMore}
              disabled={loadingMore}
              aria-busy={loadingMore}
            >
              {loadingMore ? "Loading older pieces…" : "Load older coverage"}
            </Button>
          </div>
        )}
        {!loading && allLoaded && (
          <div className={styles.loadMore}>
            <span className={styles.end}>
              That's the whole archive — 2022 to today.
            </span>
          </div>
        )}
      </div>
    </PageShell>
  );
}
