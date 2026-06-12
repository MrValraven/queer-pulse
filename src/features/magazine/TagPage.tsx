import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./TagPage.module.css";
import { Button } from '../../shared/components/ui'
import { memberName } from '../members/data/members'

const ARTICLE = routes.article;
const NEWSLETTER = routes.newsletter;

const CHIPS = ["All · 42", "Health", "Migration", "Work", "Public services", "The city", "Money", "Family", "Activism", "Profiles", "Interviews"];

interface Item {
  kicker: string;
  read: string;
  title: React.ReactNode;
  dek: string;
  byline: React.ReactNode;
}
const ITEMS: Item[] = [
  { kicker: "Reportage", read: "· 22 min · Issue 07", title: <>A history of the lifeline, <em>1995–2025.</em></>, dek: "Three decades of ILGA Portugal's helpline, told through the calls operators remember and the ones they can't.", byline: <>By <b>Catarina Vaz</b> · 12 Dec 2025</> },
  { kicker: "Reported essay", read: "· 17 min · Issue 06", title: <>The visa queue is <em>a kind of closet.</em></>, dek: "Three queer migrants on what it means to wait for a residency permit while not being out to your case officer.", byline: <>By <b>Sara Pinheiro</b> · 18 Sep 2025</> },
  { kicker: "Reportage", read: "· 16 min · Issue 08", title: <>Inside the back room of <em>Café Beirão.</em></>, dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.", byline: <>By <b>Jonas Ferreira</b> · 14 Mar 2026</> },
  { kicker: "Interview", read: "· 19 min · Issue 06", title: <>Mariza Câmara, <em>district health director.</em></>, dek: "An hour-long conversation about queer health policy in Lisbon's Câmara Municipal — what passed, what got buried.", byline: <>By <b>Sara Pinheiro</b> &amp; <b>{memberName('sofia')}</b> · 14 Sep 2025</> },
  { kicker: "Long read", read: "· 24 min · Issue 05", title: <>Six months on a four-day week.</>, dek: "A studio that closes on Fridays, told from inside — what it does to the work, the staff, and the math.", byline: <>By <b>Tomás Mendes</b> · 4 Jun 2025</> },
  { kicker: "Reported essay", read: "· 14 min · Issue 07", title: <>What the SNS gets right (and where it <em>still leaves you waiting</em>).</>, dek: "Six months reporting inside three regional health centres in Lisbon and the Algarve.", byline: <>By <b>Sara Pinheiro</b> · 8 Apr 2026</> },
  { kicker: "Profile", read: "· 18 min · Issue 04", title: <>The lawyer who only takes <em>cases nobody else will.</em></>, dek: "Twenty-one years of asylum work, told over five lunches.", byline: <>By <b>Anika Kovač</b> · 12 Mar 2025</> },
  { kicker: "Reportage", read: "· 21 min · Issue 03", title: <>A village called <em>everywhere.</em></>, dek: "In Trás-os-Montes, the rural queers reshaping who gets to leave.", byline: <>By <b>Luísa Gomes</b> · 22 Dec 2024</> },
  { kicker: "Long read", read: "· 26 min · Issue 02", title: <>The longest night of <em>Lisboa Pride.</em></>, dek: "A behind-the-scenes account of march night with the legal observer team — twelve hours, six incidents, one resignation.", byline: <>By <b>Catarina Vaz</b> · 28 Sep 2024</> },
  { kicker: "Reported essay", read: "· 15 min · Issue 01", title: <>What we owe <em>each other.</em></>, dek: "The inaugural essay. On chosen family, mutual aid, and how the magazine itself got made.", byline: <>By <b>Marta Reis</b> · 12 Jun 2024</> },
];

export function TagPage() {
  const { showToast } = useToast();
  const [activeChip, setActiveChip] = useState(0);

  return (
    <PageShell>
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
                onClick={() => setActiveChip(i)}
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

        <section className={styles.list}>
          {ITEMS.map((it, i) => (
            <Link to={ARTICLE} className={styles.item} key={i}>
              <div className={styles.itemKicker}>
                {it.kicker} <span className={styles.read}>{it.read}</span>
              </div>
              <h3 className={styles.itemH}>{it.title}</h3>
              <p className={styles.itemDek}>{it.dek}</p>
              <div className={styles.itemByline}>{it.byline}</div>
            </Link>
          ))}
        </section>

        <div className={styles.loadMore}>
          <Button
            type="button" variant="ghost"
            onClick={() => showToast("Loading older long reads…", "info")}
          >
            Load 32 older long reads
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
