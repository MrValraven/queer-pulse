import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  buildDoSay,
  buildDontSay,
  buildFaqs,
  buildLessons,
} from "./caregivers.data";
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
  const lessons = useMemo(() => buildLessons(), []);

  return (
    <section className={styles.start}>
      <div className="wrap">
        <SectionHead
          title={
            <Translation
              i18nKey="community:caregivers.startHere.title"
              components={{ em: <em /> }}
            />
          }
        >
          <Translation
            i18nKey="community:caregivers.startHere.lead"
            components={{ em: <em /> }}
          />
        </SectionHead>
        <div className={styles.lessons}>
          {lessons.map((lesson) => (
            <Link key={lesson.number} to={lesson.to} className={styles.lesson}>
              <div className={styles.lessonN}>
                <em>{lesson.number}</em>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.body}</p>
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
  const faqs = useMemo(() => buildFaqs(), []);

  return (
    <section className={styles.questions}>
      <div className="wrap">
        <SectionHead
          title={
            <Translation
              i18nKey="community:caregivers.commonQuestions.title"
              components={{ em: <em /> }}
            />
          }
        />
        <div className={styles.qList}>
          {faqs.map((faq, i) => {
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
                  <span>{faq.question}</span>
                  <FiChevronDown aria-hidden className={styles.qChevron} />
                </button>
                {isOpen && <div className={styles.qA}>{faq.answer}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** The plum "Don't say / Do say" comparison strip. */
export function DontDoSay() {
  const { t } = useTranslation();
  const dontSay = useMemo(() => buildDontSay(t), [t]);
  const doSay = useMemo(() => buildDoSay(), []);

  return (
    <section className={styles.dont}>
      <div className="wrap">
        <div className={styles.dontInner}>
          <div className={styles.dEb}>
            {t("community:caregivers.dontDoSay.eyebrow")}
          </div>
          <h2>
            <Translation
              i18nKey="community:caregivers.dontDoSay.heading"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.dLead}>
            {t("community:caregivers.dontDoSay.lead")}
          </p>
          <div className={styles.compareD}>
            <div>
              <h3>
                <Translation
                  i18nKey="community:caregivers.dontDoSay.dontHeading"
                  components={{ em: <em /> }}
                />
              </h3>
              <ul>
                {dontSay.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>
                <Translation
                  i18nKey="community:caregivers.dontDoSay.doHeading"
                  components={{ em: <em /> }}
                />
              </h3>
              <ul>
                {doSay.map((line, i) => (
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
