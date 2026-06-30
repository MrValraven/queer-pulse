import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { useSimulatedLoad } from "../../shared/hooks";
import styles from "./TagPage.module.css";
import { Button, EmptyState, FadeIn, SkeletonLine } from '../../shared/components/ui'
import { memberName } from '../members/data/members'

function ItemSkeleton() {
  // Mirrors the real .item: kicker line, two-line title, dek, byline.
  return (
    <div className={styles.item} aria-hidden>
      <SkeletonLine width={140} height={11} />
      <SkeletonLine width="85%" height={24} style={{ marginTop: 4 }} />
      <SkeletonLine width="60%" height={24} />
      <SkeletonLine width="95%" height={14} style={{ marginTop: 4 }} />
      <SkeletonLine width="40%" height={12.5} style={{ marginTop: 4 }} />
    </div>
  );
}

const ARTICLE = routes.article;
const NEWSLETTER = routes.newsletter;

const CHIPS = ["All · 42", "Health", "Migration", "Work", "Public services", "The city", "Money", "Family", "Activism", "Profiles", "Interviews"];

interface Item {
  kicker: string;
  read: string;
  title: React.ReactNode;
  dek: string;
  byline: React.ReactNode;
  topics: string[];
}
const ITEMS: Item[] = [
  { kicker: "Reportage", read: "· 22 min · Issue 07", title: <>A history of the lifeline, <em>1995–2025.</em></>, dek: "Three decades of ILGA Portugal's helpline, told through the calls operators remember and the ones they can't.", byline: <>By <b>Catarina Vaz</b> · 12 Dec 2025</>, topics: ["Health", "Activism"] },
  { kicker: "Reported essay", read: "· 17 min · Issue 06", title: <>The visa queue is <em>a kind of closet.</em></>, dek: "Three queer migrants on what it means to wait for a residency permit while not being out to your case officer.", byline: <>By <b>Sara Pinheiro</b> · 18 Sep 2025</>, topics: ["Migration", "Public services"] },
  { kicker: "Reportage", read: "· 16 min · Issue 08", title: <>Inside the back room of <em>Café Beirão.</em></>, dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.", byline: <>By <b>Jonas Ferreira</b> · 14 Mar 2026</>, topics: ["Health", "The city"] },
  { kicker: "Interview", read: "· 19 min · Issue 06", title: <>Mariza Câmara, <em>district health director.</em></>, dek: "An hour-long conversation about queer health policy in Lisbon's Câmara Municipal — what passed, what got buried.", byline: <>By <b>Sara Pinheiro</b> &amp; <b>{memberName('sofia')}</b> · 14 Sep 2025</>, topics: ["Interviews", "Health", "Public services"] },
  { kicker: "Long read", read: "· 24 min · Issue 05", title: <>Six months on a four-day week.</>, dek: "A studio that closes on Fridays, told from inside — what it does to the work, the staff, and the math.", byline: <>By <b>Tomás Mendes</b> · 4 Jun 2025</>, topics: ["Work", "Money"] },
  { kicker: "Reported essay", read: "· 14 min · Issue 07", title: <>What the SNS gets right (and where it <em>still leaves you waiting</em>).</>, dek: "Six months reporting inside three regional health centres in Lisbon and the Algarve.", byline: <>By <b>Sara Pinheiro</b> · 8 Apr 2026</>, topics: ["Health", "Public services"] },
  { kicker: "Profile", read: "· 18 min · Issue 04", title: <>The lawyer who only takes <em>cases nobody else will.</em></>, dek: "Twenty-one years of asylum work, told over five lunches.", byline: <>By <b>Anika Kovač</b> · 12 Mar 2025</>, topics: ["Profiles", "Migration"] },
  { kicker: "Reportage", read: "· 21 min · Issue 03", title: <>A village called <em>everywhere.</em></>, dek: "In Trás-os-Montes, the rural queers reshaping who gets to leave.", byline: <>By <b>Luísa Gomes</b> · 22 Dec 2024</>, topics: ["The city", "Family"] },
  { kicker: "Long read", read: "· 26 min · Issue 02", title: <>The longest night of <em>Lisboa Pride.</em></>, dek: "A behind-the-scenes account of march night with the legal observer team — twelve hours, six incidents, one resignation.", byline: <>By <b>Catarina Vaz</b> · 28 Sep 2024</>, topics: ["Activism"] },
  { kicker: "Reported essay", read: "· 15 min · Issue 01", title: <>What we owe <em>each other.</em></>, dek: "The inaugural essay. On chosen family, mutual aid, and how the magazine itself got made.", byline: <>By <b>Marta Reis</b> · 12 Jun 2024</>, topics: ["Family", "Activism"] },
];

/** The full back-catalogue: the curated pieces plus an archive generated
 *  deterministically from them, so "Load older" reveals real list rows. */
const ARCHIVE: Item[] = Array.from({ length: 32 }, (_, i) => {
  const base = ITEMS[i % ITEMS.length]!;
  const issue = 9 - ((i % 9) + 1);
  return {
    ...base,
    read: `· ${12 + (i % 14)} min · Issue 0${Math.max(1, issue)}`,
    byline: <>{base.byline} · from the archive</>,
  };
});
const ALL_ITEMS: Item[] = [...ITEMS, ...ARCHIVE];
const PAGE_SIZE = 9;

export function TagPage() {
  const loading = useSimulatedLoad();
  const [activeChip, setActiveChip] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisible((v) => v + PAGE_SIZE);
      setLoadingMore(false);
    }, 600);
  };

  const matched = useMemo(() => {
    if (activeChip === 0) return ALL_ITEMS;
    const topic = CHIPS[activeChip]!;
    return ALL_ITEMS.filter((it) => it.topics.includes(topic));
  }, [activeChip]);

  const filtered = matched.slice(0, visible);
  const remaining = matched.length - filtered.length;

  return (
    <PageShell>
      <MagazineMasthead active="longreads" />
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Magazine · category</div>
            <h1 className={styles.h1}>
              Long <em>reads.</em>
            </h1>
            <p className={styles.dek}>
              <b>Twenty-minute pieces and up.</b> Reported essays, multi-source
              profiles, and the kind of long-form work that asks something of the
              reader. Slow journalism on purpose. New piece every other Thursday.
            </p>
            <div className={styles.stats}>
              <span>
                <b>
                  <em>42</em>
                </b>
                Pieces in this section
              </span>
              <span>
                <b>14</b>Min average read
              </span>
              <span>
                <b>9</b>Issues represented
              </span>
              <span>
                <b>18</b>Contributors
              </span>
            </div>
          </div>
        </section>

        <div className={styles.chipsRow}>
          <div className={styles.chipsInner}>
            <span className={styles.chipsLabel}>Filter</span>
            {CHIPS.map((c, i) => (
              <button
                key={c}
                type="button"
                className={[styles.chip, activeChip === i && styles.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  setActiveChip(i);
                  setVisible(PAGE_SIZE);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <section className={styles.featured}>
          <div className={styles.feat}>
            <div>
              <div className={styles.featKicker}>Featured · Issue 09 · 14 min read</div>
              <h2 className={styles.featH}>
                <Link to={ARTICLE}>
                  Five things I learned <em>navigating Lisbon's trans health system.</em>
                </Link>
              </h2>
              <p className={styles.featDek}>
                Six months reporting on the SNS, three regional clinics, and what
                nobody tells you about waiting lists, referrals, and getting a hormone
                prescription without losing a year of your life. The cover story of
                issue 09.
              </p>
              <div className={styles.featByline}>
                <div className="av">SP</div>
                <span>
                  By <b>Sara Pinheiro</b> · published 6 Jun 2026 · <b>284</b> reads this
                  week
                </span>
              </div>
            </div>
            <div className={styles.featImg}>Hero · cover essay</div>
          </div>
        </section>

        <div className={styles.curator}>
          <div className={styles.curatorCard}>
            <div>
              <div className={styles.curatorEyebrow}>Editor's note</div>
              <p className={styles.curatorText}>
                Long reads are how we earn permission to ask{" "}
                <em>uncomfortable questions.</em> If you only have time for one piece
                this month, make it the cover.
              </p>
              <p className={styles.curatorBy}>
                — <b>Marta Reis</b>, editor in chief
              </p>
            </div>
            <Button to={NEWSLETTER} variant="ghost-dark">
              Get long reads by email →
            </Button>
          </div>
        </div>

        {loading ? (
          <section className={styles.list}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ItemSkeleton key={i} />
            ))}
          </section>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FiFileText />}
            title="No long reads in this category yet"
            description={<>Nothing filed under <em>{CHIPS[activeChip]}</em> in long reads so far. Browse every piece, or get the next one by email.</>}
            action={{ label: 'Show all long reads', onClick: () => { setActiveChip(0); setVisible(PAGE_SIZE); } }}
            secondaryAction={{ label: 'Get long reads by email →', to: NEWSLETTER }}
          />
        ) : (
          <section className={styles.list}>
            {filtered.map((it, i) => (
              <FadeIn as={Link} to={ARTICLE} className={styles.item} key={i} delay={Math.min(i % PAGE_SIZE, 8) * 60}>
                <div className={styles.itemKicker}>
                  {it.kicker} <span className={styles.read}>{it.read}</span>
                </div>
                <h3 className={styles.itemH}>{it.title}</h3>
                <p className={styles.itemDek}>{it.dek}</p>
                <div className={styles.itemByline}>{it.byline}</div>
              </FadeIn>
            ))}
            {loadingMore &&
              Array.from({ length: Math.min(PAGE_SIZE, remaining) }).map((_, i) => (
                <ItemSkeleton key={`more-${i}`} />
              ))}
          </section>
        )}

        {!loading && remaining > 0 && (
          <div className={styles.loadMore}>
            <Button
              type="button" variant="ghost"
              onClick={loadMore}
              disabled={loadingMore}
              aria-busy={loadingMore}
            >
              {loadingMore ? "Loading older long reads…" : `Load ${Math.min(PAGE_SIZE, remaining)} older long reads`}
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
