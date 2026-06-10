import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./PrideMonthPage.module.css";
import { Button } from '../../shared/components/ui'

const GATHERING = linkToPath("QueerPulse Gathering.html");
const MANIFESTO = linkToPath("QueerPulse Manifesto.html");
const SAFETY = linkToPath("QueerPulse Safety.html");
const HATE_CRIME = linkToPath("QueerPulse Hate Crime.html");
const ARTICLE = linkToPath("QueerPulse Article.html");

const CHIPS = ["All · 38", "Free / pay-what-you-can", "Quiet / sensory-friendly", "Trans-led", "First-week", "March weekend", "Last-week reflective"];

interface Ev {
  d: string;
  m: string;
  day: string;
  kind: string;
  title: React.ReactNode;
  host: React.ReactNode;
  free: string;
  count: string;
  headline?: boolean;
}
const EVENTS: Ev[] = [
  { d: "02", m: "Jun", day: "Mon", kind: "Opening · all welcome", title: <>June kickoff · <em>open back room</em></>, host: <>Hosted by <b>Catarina Vaz</b> · Café Beirão · 19:00</>, free: "Free entry", count: "32 going" },
  { d: "06", m: "Jun", day: "Fri", kind: "Reading · quiet", title: <>Stone Butch Blues — <em>book club night #4</em></>, host: <>Hosted by <b>Sofia Castaño</b> · Mercearia Rosa back room · 19:30</>, free: "Free", count: "4 spots left" },
  { d: "10", m: "Jun", day: "Tue", kind: "Healthcare · trans-led", title: <>Open clinic night · <em>extended June edition</em></>, host: <>Hosted by <b>Anika Kovač · Trans Hub</b> · Café Beirão · 19:00</>, free: "Pay what you can", count: "Waitlist · 5 spots" },
  { d: "14", m: "Jun", day: "Sat", kind: "Workshop · sign-making", title: <>Banners &amp; placards · <em>march prep</em></>, host: <>Hosted by <b>André Bento</b> · Atelier Pulso · 11:00–17:00</>, free: "Materials free", count: "Drop-in" },
  { d: "17", m: "Jun", day: "Tue", kind: "Legal · ILGA partner", title: <>Know-your-rights crash course <em>for the march</em></>, host: <>Hosted by <b>Catarina &amp; ILGA Portugal</b> · ILGA office · 18:30</>, free: "Free", count: "14 going · open" },
  { d: "21", m: "Jun", day: "Sat", kind: "The headliner", title: <>Marcha do Orgulho · <em>QueerPulse block</em></>, host: <>Meeting <b>15:30</b> · Marquês de Pombal · west steps</>, free: "Free · the whole city", count: "184 marching", headline: true },
  { d: "21", m: "Jun", day: "Sat", kind: "After · quiet · 21+", title: <>Post-march decompression · <em>just sitting</em></>, host: <>Hosted by <b>Rita Vasquez</b> · Café Beirão · 21:30–01:00</>, free: "Free", count: "52 going" },
  { d: "24", m: "Jun", day: "Tue", kind: "For parents", title: <>Mothers &amp; fathers night · <em>chosen and biological</em></>, host: <>Hosted by <b>Queer Parent Network</b> · Trans Hub office · 18:00</>, free: "Free", count: "22 going" },
  { d: "28", m: "Jun", day: "Sat", kind: "Closing · reflective", title: <>Last day of June · <em>open mic &amp; goodbye-to-pride</em></>, host: <>Hosted by <b>Marta &amp; Tomás</b> · Café Beirão · 19:00–23:00</>, free: "Free · all welcome", count: "RSVPs open" },
];

const MARCH_META = [
  ["Date", "Sat 21 June 2026 · 16:00 start"],
  ["Meeting point", "Marquês de Pombal · west steps"],
  ["QP block", "~15:30 · look for the coral flag"],
  ["Legal observers", "40 trained · stationed every 200m"],
  ["Quick-exit cars", "3 · driven by Sandra, Rui, Catarina"],
];

const SAFETY_CARDS: { icon: string; h: React.ReactNode; p: string; href: string }[] = [
  { icon: "🛡", h: <>Safety <em>brief</em> for the march</>, p: "Pocket card. Where the observers are. What to do if. Print it, screenshot it, carry it.", href: SAFETY },
  { icon: "💬", h: <>Crisis chat · <em>extended hours</em></>, p: "Staffed 24/7 for June. Trained peer responders reply in <90s. Anonymous if you need it.", href: SAFETY },
  { icon: "⚠", h: <>Hate-crime <em>reporting bridge</em></>, p: "One form. Goes to ILGA's casework lead within 24h with your consent. We've routed 300+ cases.", href: HATE_CRIME },
];

const READING = [
  { kicker: "Cover · Issue 09", title: <>Five things I learned <em>navigating Lisbon's trans health system.</em></>, d: "14 min read · Sara Pinheiro. The piece we'd keep in print if we could only keep one.", href: ARTICLE },
  { kicker: "Document", title: <>The QueerPulse <em>Manifesto.</em></>, d: "~ 6 min read · revised November 2025. Why this thing exists. Worth re-reading once a year.", href: MANIFESTO },
  { kicker: "Long read · Issue 02", title: <>The longest night of <em>Lisboa Pride.</em></>, d: "26 min read · Catarina Vaz. Behind the scenes with last year's legal observer team.", href: ARTICLE },
  { kicker: "Essay · Issue 07", title: <>What we owe <em>each other.</em></>, d: "15 min read · Marta Reis. The inaugural essay, still the operating system.", href: ARTICLE },
];

export function PrideMonthPage() {
  const { showToast } = useToast();
  const [activeChip, setActiveChip] = useState(0);

  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>June 2026 · Pride Month · Lisbon</span>
            <h1 className={styles.h1}>
              Quietly, <em>loudly,</em> together.
            </h1>
            <p className={styles.dek}>
              Thirty days of gatherings, reading, organising, and showing up —
              curated by members, hosted at safe spaces, and free where it matters.{" "}
              <em>This is not a sale.</em> No rainbow logos, no sponsored content, no
              toolkits. Just the events, the writing, and the practical guides for
              staying safe and together this month.
            </p>
            <div className={styles.actions}>
              <Button href="#calendar" variant="primary">
                See all 38 events
              </Button>
              <Button href="#march" variant="ghost-dark">
                Lisboa Pride · 21 Jun
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.letter}>
          <div className={styles.letterInner}>
            <div className={styles.letterKicker}>Editor's note · from Marta Reis</div>
            <h2 className={styles.letterH}>
              June is a <em>working month,</em> not a corporate one.
            </h2>
            <p className={styles.letterP}>
              Once a year the city goes briefly stripey, the supermarkets get a paint
              job, and twelve airlines launch a "be authentic" campaign.{" "}
              <strong>None of this is for us.</strong> It is for whoever's paying for
              it.
            </p>
            <p className={styles.letterP}>
              What this month is actually for, on QueerPulse, is the same thing it was
              when this began: <em>people doing the work</em>, the rooms staying open,
              the lists getting longer, the lawyers showing up at 06:00 with binders.
              The march. The reading. The hand-off between the clinic and the bar. The
              mothers who finally come this year.
            </p>
            <p className={styles.letterP}>
              If you read one thing this month, read the{" "}
              <Link to={MANIFESTO}>manifesto</Link>. If you go to one thing, make it{" "}
              <a href="#march">the march</a>. <em>If you do one thing for someone else</em>,
              walk a friend home.
            </p>
            <p className={styles.letterSign}>— Marta · 1 June 2026</p>
          </div>
        </section>

        <section className={styles.march} id="march">
          <div className={styles.marchInner}>
            <div>
              <div className={styles.marchKicker}>The headliner · 21 June</div>
              <h2 className={styles.marchH}>
                Marcha do <em>Orgulho Lisboa 2026.</em>
              </h2>
              <p className={styles.marchD}>
                Twenty-eighth edition. Starts at <b>Marquês de Pombal</b>, ends at{" "}
                <b>Terreiro do Paço</b>. QueerPulse marches as one block — meeting
                point at <em>15:30</em>, sign-making at Café Beirão from <em>13:00</em>.
                Forty trained legal observers on the route, courtesy of our ILGA
                Portugal partnership.
              </p>
              <div className={styles.marchMeta}>
                {MARCH_META.map(([k, v]) => (
                  <div className={styles.mmRow} key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <div className={styles.marchBtns}>
                <Button to={GATHERING} variant="primary">
                  RSVP to the QP block
                </Button>
                <Button to={SAFETY} variant="ghost">
                  Read the safety brief
                </Button>
              </div>
            </div>
            <div className={styles.marchImg}>Marcha do Orgulho · last year's route map</div>
          </div>
        </section>

        <section className={styles.calSection} id="calendar">
          <div className={styles.calH}>
            <h2>
              Thirty days, <em>thirty-eight events.</em>
            </h2>
            <span className={styles.meta}>Hosted by 14 members and 6 partner spaces</span>
          </div>
          <div className={styles.calChips}>
            {CHIPS.map((c, i) => (
              <button
                key={c}
                type="button"
                className={[styles.calChip, activeChip === i && styles.calChipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveChip(i)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className={styles.calList}>
            {EVENTS.map((e, i) => (
              <Link
                to={GATHERING}
                key={i}
                className={[styles.evRow, e.headline && styles.headline]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.evDate}>
                  <div className={styles.evDateD}>{e.d}</div>
                  <div className={styles.evDateM}>{e.m}</div>
                  <div className={styles.evDateDay}>{e.day}</div>
                </div>
                <div className={styles.evInfo}>
                  <div className={styles.evKind}>{e.kind}</div>
                  <div className={styles.evTitle}>{e.title}</div>
                  <div className={styles.evHost}>{e.host}</div>
                </div>
                <div className={styles.evAction}>
                  <span className={styles.free}>{e.free}</span>
                  <b>{e.count}</b>
                </div>
              </Link>
            ))}
            <div className={styles.calMore}>
              <Button
                type="button" variant="ghost"
                onClick={() => showToast("Loading more events…", "info")}
              >
                Show 29 more events
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.safetyRow}>
          <div className={styles.safetyInner}>
            <h2 className={styles.safetyH}>
              Pride is the <em>most-policed</em> month of the year. Know your tools.
            </h2>
            <p className={styles.safetySub}>
              In Portugal, the march is generally safe — but the days around it are
              when verbal and physical harassment incidents spike. We treat this month
              seriously.
            </p>
            <div className={styles.safetyGrid}>
              {SAFETY_CARDS.map((c, i) => (
                <Link to={c.href} className={styles.safetyCard} key={i}>
                  <div className={styles.safetyIc}>{c.icon}</div>
                  <h4>{c.h}</h4>
                  <p>{c.p}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.readSection}>
          <div className={styles.calH}>
            <h2>
              Pride month <em>reading list.</em>
            </h2>
            <span className={styles.meta}>From Sara Pinheiro, magazine editor</span>
          </div>
          <div className={styles.readGrid}>
            {READING.map((r, i) => (
              <Link to={r.href} className={styles.readCard} key={i}>
                <div className={styles.readKicker}>{r.kicker}</div>
                <div className={styles.readTitle}>{r.title}</div>
                <div className={styles.readD}>{r.d}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
