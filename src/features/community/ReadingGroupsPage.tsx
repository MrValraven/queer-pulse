import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./ReadingGroupsPage.module.css";
import { Button } from '../../shared/components/ui'

type Genre = "fiction" | "nonfiction" | "theory" | "poetry" | "memoir";
type Format = "irl" | "online";

interface Group {
  id: string;
  genre: Genre;
  format: Format;
  book: string;
  author: string;
  spine: string;
  spineColor: string;
  name: string;
  desc: string;
  where: string;
  frequency: string;
  spots: number;
  lang: string;
}

const GROUPS: Group[] = [
  {
    id: "g1",
    genre: "fiction",
    format: "irl",
    book: "Giovanni's Room",
    author: "James Baldwin",
    spine: "G",
    spineColor: "#2D1B3D",
    name: "Bairro Alto Fiction",
    desc: "Monthly fiction group that started two years ago with Mrs Dalloway and has not looked back. Argumentative, warm, and always overruns by an hour.",
    where: "Príncipe Real café (rotates)",
    frequency: "Monthly · last Sunday",
    spots: 2,
    lang: "EN / PT",
  },
  {
    id: "g2",
    genre: "theory",
    format: "irl",
    book: "Gender Trouble",
    author: "Judith Butler",
    spine: "G",
    spineColor: "#4A8C6F",
    name: "Theory Thursdays",
    desc: "We read slowly. We argue in footnotes. Everyone is welcome regardless of academic background — this is the opposite of a seminar.",
    where: "Someone's kitchen in Mouraria",
    frequency: "Every 3 weeks · Thursday evening",
    spots: 1,
    lang: "EN",
  },
  {
    id: "g3",
    genre: "memoir",
    format: "online",
    book: "The Argonauts",
    author: "Maggie Nelson",
    spine: "A",
    spineColor: "#C85A40",
    name: "Memoir & Essay Online",
    desc: "Online group, no time zone requirement. We read memoirs and essays about queer life. Written discussion on Fridays, optional voice call on Sundays.",
    where: "Online (Discord)",
    frequency: "Monthly",
    spots: 4,
    lang: "EN",
  },
  {
    id: "g4",
    genre: "fiction",
    format: "irl",
    book: "A Little Life",
    author: "Hanya Yanagihara",
    spine: "L",
    spineColor: "#7050AA",
    name: "Long Reads Lisbon",
    desc: "For people who want to read the big, difficult books together. Emotional support provided. Content warnings posted in advance.",
    where: "Intendente — rotating hosts",
    frequency: "6-weekly",
    spots: 0,
    lang: "EN / PT",
  },
  {
    id: "g5",
    genre: "nonfiction",
    format: "irl",
    book: "Pleasure Activism",
    author: "adrienne maree brown",
    spine: "P",
    spineColor: "#B4883C",
    name: "Politics & Practice",
    desc: "Queer politics, activism, and community organising — read together and discussed in the context of Lisbon. Bilingual by default.",
    where: "Casa Qui, Mouraria",
    frequency: "Monthly · first Saturday",
    spots: 3,
    lang: "PT / EN",
  },
  {
    id: "g6",
    genre: "poetry",
    format: "online",
    book: "Citizen: An American Lyric",
    author: "Claudia Rankine",
    spine: "C",
    spineColor: "#4A8C6F",
    name: "Poetry Reading (Online)",
    desc: "We read one collection per month and meet online to discuss. Sometimes we read aloud. Sometimes we just send each other the lines that wrecked us.",
    where: "Online (Zoom)",
    frequency: "Monthly",
    spots: 5,
    lang: "EN",
  },
  {
    id: "g7",
    genre: "fiction",
    format: "irl",
    book: "Orlando",
    author: "Virginia Woolf",
    spine: "O",
    spineColor: "#C85A40",
    name: "Queer Classics",
    desc: "We reread the canon with queer eyes. Slow paced, generously hosted, always food. Portuguese-language members welcome — some meetings run bilingual.",
    where: "Alfama (host's home)",
    frequency: "6-weekly · Saturday afternoon",
    spots: 2,
    lang: "EN / PT",
  },
  {
    id: "g8",
    genre: "nonfiction",
    format: "irl",
    book: "Mutual Aid",
    author: "Dean Spade",
    spine: "M",
    spineColor: "#2D1B3D",
    name: "Solidarity Reads",
    desc: "Books about care, mutual aid, and community organising. Practical bias — we end every session with one thing we are going to do differently.",
    where: "LX Factory area",
    frequency: "Monthly · Wednesday evening",
    spots: 3,
    lang: "EN",
  },
];

const GENRE_BG: Record<Genre, string> = {
  fiction: "rgba(45,27,61,.07)",
  nonfiction: "rgba(74,140,111,.1)",
  theory: "rgba(232,119,90,.09)",
  poetry: "rgba(74,140,111,.08)",
  memoir: "rgba(45,27,61,.06)",
};
const GENRE_FG: Record<Genre, string> = {
  fiction: "var(--plum)",
  nonfiction: "var(--jade)",
  theory: "var(--accent-ink)",
  poetry: "var(--jade)",
  memoir: "var(--ink-60)",
};

const GENRE_FILTERS: { id: Genre | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fiction", label: "Fiction" },
  { id: "nonfiction", label: "Non-fiction" },
  { id: "theory", label: "Theory" },
  { id: "poetry", label: "Poetry" },
  { id: "memoir", label: "Memoir" },
];
const FORMAT_FILTERS: { id: Format | "all"; label: string }[] = [
  { id: "all", label: "Any" },
  { id: "irl", label: "In-person" },
  { id: "online", label: "Online" },
];

export function ReadingGroupsPage() {
  const { showToast } = useToast();
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [format, setFormat] = useState<Format | "all">("all");
  const messages = linkToPath("QueerPulse Messages.html");

  const items = GROUPS.filter(
    (g) =>
      (genre === "all" || g.genre === genre) &&
      (format === "all" || g.format === format),
  );

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Community · Reading</div>
          <h1 className={styles.title}>
            Read together.
            <br />
            <em>Trust faster.</em>
          </h1>
          <p className={styles.sub}>
            Small groups, one book, one month. No homework anxiety, no
            gatekeeping. The best way to find your people in a new city is to
            argue about a book with them.
          </p>
          <div className={styles.why}>
            <div className={styles.w}>
              <strong>Queer-curated books</strong>
              <span>
                Every group chooses its own reading. We do not tell you what
                matters.
              </span>
            </div>
            <div className={styles.w}>
              <strong>Small by design</strong>
              <span>Groups cap at 6–8 people. Real conversations, not lectures.</span>
            </div>
            <div className={styles.w}>
              <strong>Mixed formats</strong>
              <span>
                In-person in cafés and homes. Online for those outside Lisbon or
                with access needs.
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.fbInner}>
          <span className={styles.fbLabel}>Genre</span>
          {GENRE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.chip, genre === f.id && styles.chipActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setGenre(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div className={styles.fbSep} />
          <span className={styles.fbLabel}>Format</span>
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.chip, format === f.id && styles.chipActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFormat(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div className={styles.fbSep} />
          <div className={styles.count}>
            <b>{items.length}</b> group{items.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {items.length === 0 && (
              <div className={styles.empty}>
                <p>No groups match — try different filters, or start your own.</p>
              </div>
            )}
            {items.map((g) => {
              const spotsClass =
                g.spots === 0
                  ? styles.spotsFull
                  : g.spots <= 1
                    ? styles.spotsAlmost
                    : styles.spotsOpen;
              const spotsText =
                g.spots === 0
                  ? "Full"
                  : `${g.spots} spot${g.spots !== 1 ? "s" : ""} left`;
              return (
                <article className={styles.gc} key={g.id}>
                  <div className={styles.gcBook}>
                    <div
                      className={styles.gcSpine}
                      style={{ background: g.spineColor }}
                    >
                      {g.spine}
                    </div>
                    <div className={styles.gcBookInfo}>
                      <div className={styles.gcBookTitle}>{g.book}</div>
                      <div className={styles.gcBookAuthor}>{g.author}</div>
                      <span
                        className={styles.gcGenre}
                        style={{
                          background: GENRE_BG[g.genre],
                          color: GENRE_FG[g.genre],
                        }}
                      >
                        {g.genre}
                      </span>
                    </div>
                  </div>
                  <div className={styles.gcBody}>
                    <div className={styles.gcName}>{g.name}</div>
                    <div className={styles.gcDesc}>{g.desc}</div>
                    <div className={styles.gcMeta}>
                      <span
                        className={[
                          styles.gm,
                          g.format === "irl" ? styles.gmIrl : styles.gmOnline,
                        ].join(" ")}
                      >
                        {g.format === "irl" ? "In person · " : "Online · "}
                        {g.where}
                      </span>
                      <span className={styles.gm}>{g.frequency}</span>
                      <span className={styles.gm}>{g.lang}</span>
                    </div>
                  </div>
                  <div className={styles.gcFoot}>
                    <span className={`${styles.gcSpots} ${spotsClass}`}>
                      {spotsText}
                    </span>
                    {g.spots === 0 ? (
                      <button
                        type="button"
                        className={`${styles.gcJoin} ${styles.gcJoinDisabled}`}
                        onClick={() => showToast("Added to waitlist", "info")}
                      >
                        Join waitlist
                      </button>
                    ) : (
                      <Link to={messages} className={styles.gcJoin}>
                        Request to join
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.startStrip}>
            <div className={styles.ssText}>
              <h3>
                Start your <em>own group.</em>
              </h3>
              <p>
                Pick a book. Say how many people you want. Say where and when. We
                will list it here and match you with members who want to read the
                same thing.
              </p>
            </div>
            <form
              className={styles.ssForm}
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Group listed — we'll find your readers", "success");
              }}
            >
              <div className={styles.ssRow}>
                <label className={styles.ssLabel}>Book title &amp; author</label>
                <input
                  className={styles.ssInput}
                  type="text"
                  placeholder="e.g. Giovanni's Room — James Baldwin"
                />
              </div>
              <div className={styles.ssRow}>
                <label className={styles.ssLabel}>Why this book?</label>
                <input
                  className={styles.ssInput}
                  type="text"
                  placeholder="One sentence — what made you choose it?"
                />
              </div>
              <div className={styles.ssRow2}>
                <div className={styles.ssRow}>
                  <label className={styles.ssLabel}>Format</label>
                  <select className={styles.ssInput} defaultValue="In-person">
                    <option>In-person</option>
                    <option>Online</option>
                    <option>Either</option>
                  </select>
                </div>
                <div className={styles.ssRow}>
                  <label className={styles.ssLabel}>Max people</label>
                  <select className={styles.ssInput} defaultValue="6">
                    <option>4</option>
                    <option>6</option>
                    <option>8</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={styles.ssSubmit}>
                List my group
              </button>
            </form>
          </div>
        </div>
      </main>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Books build <em>community.</em>
          </h2>
          <p className={styles.outroSub}>
            QueerPulse reading groups have been running since 2024. Some have
            turned into friendships, some into collaborations, two into bands.
          </p>
          <Button to={linkToPath("QueerPulse Invite.html")} variant="primary" size="lg">
            Join the network
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
