import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentorProfileSkeleton } from "./MentorProfileSkeleton";
import { routes } from "../../app/routeMap";
import { MentorProfileSidebar } from "./MentorProfileSidebar";
import {
  MENTOR,
  MENTOR_PILLS,
  HOW_PARAS,
  FIT_ITEMS,
  PROCESS_STEPS,
  MENTEES,
} from "./mentorProfile.data";
import styles from "./MentorProfilePage.module.css";

const avTintClass: Record<"jade" | "coral" | "plum", string | undefined> = {
  jade: styles.avJade,
  coral: styles.avCoral,
  plum: styles.avPlum,
};

export function MentorProfilePage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.mentorship} className={styles.back}>
          {t("economy:mentorProfile.backToAll")}
        </Link>

        {loading ? (
          <MentorProfileSkeleton />
        ) : (
          <FadeIn>
            <header className={styles.head}>
              <div className={styles.portrait}>{MENTOR.portrait}</div>
              <div>
                <div className={styles.eyebrow}>{MENTOR.eyebrow}</div>
                <h1 className={styles.name}>
                  {MENTOR.firstName} <em>{MENTOR.lastName}</em>
                </h1>
                <p className={styles.role}>{MENTOR.role}</p>
                <p className={styles.quote}>{MENTOR.quote}</p>
                <div className={styles.pills}>
                  {MENTOR_PILLS.map((p) => (
                    <span
                      key={p.label}
                      className={`${styles.pill} ${p.accept ? styles.accept : ""}`}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
                <div className={styles.cta}>
                  <Button variant="primary" href="#apply">
                    Apply · application closes 14 Jun
                  </Button>
                  <Button variant="ghost" to={routes.messages}>
                    {t("economy:mentorProfile.sendQuestionCta")}
                  </Button>
                </div>
              </div>
            </header>

            <div className={styles.grid}>
              <main>
                <section className={styles.sec}>
                  <h2>
                    <Translation
                      i18nKey="economy:mentorProfile.section.howIMentor"
                      components={{ em: <em /> }}
                    />
                  </h2>
                  {HOW_PARAS.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </section>

                <section className={styles.sec}>
                  <h2>
                    <Translation
                      i18nKey="economy:mentorProfile.section.fitFor"
                      components={{ em: <em /> }}
                    />
                  </h2>
                  <div className={styles.whatGrid}>
                    {FIT_ITEMS.map((item) => (
                      <div key={item.label} className={styles.what}>
                        <b>{item.label}</b>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.sec}>
                  <h2>
                    <Translation
                      i18nKey="economy:mentorProfile.section.process"
                      components={{ em: <em /> }}
                    />
                  </h2>
                  <div>
                    {PROCESS_STEPS.map((step) => (
                      <div key={step.num} className={styles.procRow}>
                        <div className={styles.procNum}>
                          {step.num.charAt(0)}
                          <em>{step.num.charAt(1)}</em>
                        </div>
                        <div>
                          <b>{step.title}</b>
                          <span>{step.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.sec}>
                  <h2>
                    <Translation
                      i18nKey="economy:mentorProfile.section.pastMentees"
                      components={{ em: <em /> }}
                    />
                  </h2>
                  <div className={styles.menteesRow}>
                    {MENTEES.map((mentee) => (
                      <Link
                        key={mentee.initials}
                        to={routes.author}
                        className={styles.menteePill}
                      >
                        <span
                          className={`${styles.menteeAv} ${avTintClass[mentee.tint]}`}
                        >
                          {mentee.initials}
                        </span>
                        {mentee.name}
                      </Link>
                    ))}
                  </div>
                  <p className={styles.menteesFoot}>
                    All four pieces from past mentees were published — three at
                    QueerPulse Magazine, one at Mensagem de Lisboa.
                  </p>
                </section>
              </main>

              <MentorProfileSidebar />
            </div>
          </FadeIn>
        )}
      </div>
    </PageShell>
  );
}
