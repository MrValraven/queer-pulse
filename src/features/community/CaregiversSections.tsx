import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { DO_SAY, DONT_SAY, FAQS, LESSONS, ROOMS } from "./caregivers.data";
import styles from "./CaregiversPage.module.css";

/** Stacked section heading (title over an optional lead), matching the design. */
function SectionHead({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={styles.sHead}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

/** Five short reads, each linking to the closest existing guide. */
export function StartHere() {
  return (
    <section className={styles.start}>
      <div className="wrap">
        <SectionHead
          title={
            <>
              Start <em>here</em>
            </>
          }
        >
          Five short reads. Each is one specific question, answered concretely,
          in language we'd want to hear ourselves.{" "}
          <em>Not a course. Not 50 modules.</em> Five reads.
        </SectionHead>
        <div className={styles.lessons}>
          {LESSONS.map((lesson) => (
            <Link key={lesson.n} to={lesson.to} className={styles.lesson}>
              <div className={styles.lessonN}>
                <em>{lesson.n}</em>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.body}</p>
              <div className={styles.lessonMeta}>
                <span>{lesson.read}</span>
                <span>{lesson.langs}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Self-contained FAQ accordion — owns its open/closed state. */
export function CommonQuestions() {
  const [open, setOpen] = useState(0);
  return (
    <section className={styles.questions}>
      <div className="wrap">
        <SectionHead
          title={
            <>
              Common <em>questions</em>
            </>
          }
        />
        <div className={styles.qList}>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={[styles.qItem, isOpen && styles.qOpen]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className={styles.qQ}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{faq.q}</span>
                  <FiChevronDown aria-hidden className={styles.qChevron} />
                </button>
                {isOpen && <div className={styles.qA}>{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Members-only support rooms, routed to the Peer Support hub. */
export function VoiceRooms() {
  return (
    <section className={styles.groups}>
      <div className="wrap">
        <SectionHead
          title={
            <>
              Talk to <em>others</em> like you
            </>
          }
        >
          Members-only support rooms. Joining is opt-in and quiet.
        </SectionHead>
        <div className={styles.grGrid}>
          {ROOMS.map((room, i) => (
            <Link key={i} to={room.to} className={styles.gr2}>
              <div className={styles.grInfo}>
                <h4>{room.title}</h4>
                <div className={styles.grSub}>{room.sub}</div>
                <div className={styles.grMeta}>{room.meta}</div>
              </div>
              <span className={styles.grArrow} aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The plum "Don't say / Do say" comparison strip. */
export function DontDoSay() {
  return (
    <section className={styles.dont}>
      <div className="wrap">
        <div className={styles.dontInner}>
          <div className={styles.dEb}>— a small list —</div>
          <h2>
            Don't say. <em>Do say.</em>
          </h2>
          <p className={styles.dLead}>
            A few of the things we wish people had been told. Not exhaustive,
            not a script — just a few opening moves that help.
          </p>
          <div className={styles.compareD}>
            <div>
              <h3>
                Don't <em>say</em>
              </h3>
              <ul>
                {DONT_SAY.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>
                Do <em>say</em>
              </h3>
              <ul>
                {DO_SAY.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
