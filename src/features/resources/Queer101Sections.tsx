import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, HubBackLink, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { FAQ, GLOSSARY, RESOURCES, TALK, type ResType } from "./queer101.data";
import { SuggestEditModal } from "./SuggestEditModal";
import styles from "./Queer101Page.module.css";

const RES_CLASS: Record<ResType, string> = {
  Book: "typeBook",
  Film: "typeFilm",
  Podcast: "typePodcast",
  Guide: "typeGuide",
};

export function Queer101Hero() {
  return (
    <div className={styles.hero}>
      <div className="wrap">
        <HubBackLink
          to={routes.resources}
          label="Resource Library"
          tone="light"
        />
        <div className={styles.label}>Queer 101</div>
        <h1>
          Start here, wherever <em>here</em> is.
        </h1>
        <p className={styles.lead}>
          For people newly exploring their identity — or just looking for
          language that fits. You don't need to have anything figured out. This
          is not a test.
        </p>
        <div className={styles.reassure}>
          <div className={styles.reassureNote}>
            <span className={styles.dot} />
            No account required to read any of this
          </div>
          <div className={styles.reassureNote}>
            <span className={styles.dot} />
            Nothing you read here is shared with anyone
          </div>
          <div className={styles.reassureNote}>
            <span className={styles.dot} />
            You can leave and come back whenever you want
          </div>
        </div>
      </div>
    </div>
  );
}

export function Queer101Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.sec}>
      <div className="wrap">
        <h2 className={styles.h}>
          Common <em>questions.</em>
        </h2>
        <p className={styles.sub}>
          Honest answers, without assumptions about where you are right now.
        </p>
        <div className={styles.faqList}>
          {FAQ.map((f, i) => (
            <div
              key={f.q}
              className={[styles.faqItem, openFaq === i && styles.faqItemOpen]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={styles.faqQ}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className={styles.faqQText}>{f.q}</span>
                <span className={styles.faqArrow}>+</span>
              </button>
              {openFaq === i && <div className={styles.faqA}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Queer101Glossary() {
  const [editOpen, setEditOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();

  const glossary = GLOSSARY.filter(
    (g) =>
      !q ||
      g.keywords.includes(q) ||
      `${g.term} ${g.def}`.toLowerCase().includes(q),
  );

  return (
    <div className={`${styles.sec} ${styles.secCream}`}>
      <div className="wrap">
        <div className={styles.glossHeadRow}>
          <div>
            <h2 className={styles.h}>
              Language &amp; <em>terminology.</em>
            </h2>
            <p className={styles.sub} style={{ marginBottom: 0 }}>
              A living document. Community-edited — if a definition feels
              incomplete or wrong, flag it.
            </p>
          </div>
          <button
            type="button"
            className={styles.glossEditBtn}
            onClick={() => setEditOpen(true)}
          >
            Suggest an edit
          </button>
        </div>
        <input
          className={styles.glossSearch}
          type="search"
          placeholder="Search terms…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.glossGrid}>
          {glossary.map((g) => (
            <div className={styles.glossCard} key={g.term}>
              <div className={styles.glossTerm}>{g.term}</div>
              <div className={styles.glossDef}>{g.def}</div>
            </div>
          ))}
        </div>
        <div className={styles.glossNotice}>
          This glossary is a starting point, not an authority. Language evolves,
          people disagree, and definitions that feel right for one person may
          not for another.
        </div>
      </div>
      {editOpen && <SuggestEditModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}

export function Queer101Resources() {
  return (
    <div className={styles.sec}>
      <div className="wrap">
        <h2 className={styles.h}>
          Curated <em>resources.</em>
        </h2>
        <p className={styles.sub}>
          Books, films, and guides chosen by the community — not an algorithm.
          Updated regularly.
        </p>
        <div className={styles.resGrid}>
          {RESOURCES.map((r) => (
            <div className={styles.resCard} key={r.title}>
              <div className={`${styles.resType} ${styles[RES_CLASS[r.type]]}`}>
                {r.type}
              </div>
              <div className={styles.resTitle}>{r.title}</div>
              <div className={styles.resBy}>{r.by}</div>
              <div className={styles.resDesc}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Queer101TalkOptions() {
  return (
    <div className={`${styles.sec} ${styles.dark}`}>
      <div className="wrap">
        <div className={styles.talkBox}>
          <h3>
            Want to talk to <em>someone?</em>
          </h3>
          <p>
            Exploring your identity can be joyful, confusing, or both at once.
            Sometimes it helps to talk with someone who's been through something
            similar — without advice, without pressure.
          </p>
          <div className={styles.talkOptions}>
            {TALK.map((t) => (
              <div className={styles.talkOpt} key={t.title}>
                <div className={styles.talkOptTitle}>{t.title}</div>
                <div className={styles.talkOptDesc}>{t.desc}</div>
                <Link to={t.link.href} className={styles.talkOptLink}>
                  {t.link.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Queer101Outro() {
  return (
    <Outro
      title={
        <>
          You're welcome <em>here.</em>
        </>
      }
      sub="Wherever you are in the process. However long it takes. This community isn't going anywhere."
    >
      <Button to={routes.requestInvite} variant="primary" size="lg">
        Join QueerPulse
      </Button>
      <Button to={routes.communities} variant="ghost-dark" size="lg">
        Explore communities
      </Button>
    </Outro>
  );
}
