import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Mentor } from "./mentorship.data";
import styles from "./MentorDetailPage.module.css";

/** Main column: how they mentor, who they fit, and the step-by-step process. */
export function MentorDetailSections({
  m,
  first,
}: {
  m: Mentor;
  first: string;
}) {
  const { t } = useTranslation();
  const fit = [
    { labelKey: "economy:mentorDetail.fit.benefitIf", text: m.fitFor[0] },
    { labelKey: "economy:mentorDetail.fit.andIdeally", text: m.fitFor[1] },
    { labelKey: "economy:mentorDetail.fit.andMaybe", text: m.fitFor[2] },
    { labelKey: "economy:mentorDetail.fit.notRightCall", text: m.fitNot[0] },
  ].filter((x) => x.text);

  return (
    <main>
      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="economy:mentorDetail.section.howTheyMentor"
            values={{ firstName: first }}
            components={{ em: <em /> }}
          />
        </h2>
        {m.howParas.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="economy:mentorDetail.section.fitFor"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.whatGrid}>
          {fit.map((item) => (
            <div key={item.labelKey} className={styles.what}>
              <b>{t(item.labelKey)}</b>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="economy:mentorDetail.section.process"
            components={{ em: <em /> }}
          />
        </h2>
        <div>
          {m.process.map((step) => (
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
    </main>
  );
}
