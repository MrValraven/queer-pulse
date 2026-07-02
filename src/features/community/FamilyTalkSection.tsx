import { Button } from "../../shared/components/ui";
import { FORUM, LEGAL, MENTORSHIP, TALK_CARDS } from "./family.data";
import styles from "./FamilyPage.module.css";

export function FamilyTalkSection() {
  return (
    <>
      <section className={styles.talk}>
        <div className="wrap">
          <div className={styles.talkInner}>
            <div className={styles.talkLeft}>
              <h2>
                Talk to someone who's <em>been there.</em>
              </h2>
              <p>
                The Queer Parent Network connects people who are building
                families with members who've already been through it — same
                routes, similar situations. Not professionals. Just people
                who've done it and want to help.
              </p>
              <div className={styles.talkBtns}>
                <Button to={MENTORSHIP} variant="primary" size="lg">
                  Find a peer mentor
                </Button>
                <Button to={FORUM} variant="ghost-dark" size="lg">
                  Queer Parent Network →
                </Button>
              </div>
            </div>
            <div className={styles.talkCards}>
              {TALK_CARDS.map((c) => (
                <div className={styles.talkCard} key={c.name}>
                  <div
                    className={styles.tcAv}
                    style={{ background: c.bg, color: c.color }}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <div className={styles.tcName}>{c.name}</div>
                    <div className={styles.tcDetail}>{c.detail}</div>
                    <div className={styles.tcNote}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.forumCta}>
        <div className="wrap">
          <div className={styles.forumCtaInner}>
            <div className={styles.forumCtaText}>
              <h3>
                Questions the page <em>doesn't answer?</em>
              </h3>
              <p>
                The Family Building forum thread is where members share current
                experience, ask questions, and support each other through a
                process that no guide can fully capture.
              </p>
            </div>
            <div className={styles.forumCtaBtns}>
              <Button to={FORUM} variant="primary">
                Open the forum thread
              </Button>
              <Button to={LEGAL} variant="ghost">
                Legal resources →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
