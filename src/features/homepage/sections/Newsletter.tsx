import { useState, type FormEvent } from "react";
import { FiCheckCircle, FiMail } from "react-icons/fi";
import { Button, Reveal } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { digestPreview } from "../data/digestPreview";
import styles from "./Newsletter.module.css";

export function Newsletter() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      showToast(t("homepage:newsletter.emailRequiredToast"), "info");
      return;
    }
    setSubmitted(email.trim());
    showToast(t("homepage:newsletter.subscribedToast"), "success");
    setEmail("");
  }

  return (
    <section className={styles.digest} id="digest">
      <div className="wrap">
        <div className={demoMode ? styles.inner : `${styles.inner} ${styles.solo}`}>
          <div>
            <Reveal as="h2" className={styles.title}>
              <Translation
                i18nKey="homepage:newsletter.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={60}>
              {t("homepage:newsletter.subtitle")}
            </Reveal>
            {!demoMode ? (
              // No subscribe endpoint exists yet, so live mode never fakes a
              // "you're subscribed" success. Say so plainly instead of taking an
              // email that goes nowhere. The demo flow below is unchanged.
              <Reveal as="p" className={styles.sub} delay={120}>
                {t("homepage:newsletter.comingSoon")}
              </Reveal>
            ) : submitted ? (
              <Reveal className={styles.success}>
                <span className={styles.successIcon} aria-hidden>
                  <FiCheckCircle />
                </span>
                <h3 className={styles.successTitle}>
                  <Translation
                    i18nKey="homepage:newsletter.success.title"
                    components={{ em: <em /> }}
                  />
                </h3>
                <p className={styles.successBody}>
                  <Translation
                    i18nKey="homepage:newsletter.success.body"
                    values={{ email: submitted }}
                    components={{ strong: <strong /> }}
                  />
                </p>
                <p className={styles.successNext}>
                  <FiMail aria-hidden />{" "}
                  {t("homepage:newsletter.success.checkInboxNote")}
                </p>
                <Button variant="ghost-dark" onClick={() => setSubmitted(null)}>
                  {t("homepage:newsletter.success.useDifferentEmailCta")}
                </Button>
              </Reveal>
            ) : (
              <>
                <Reveal delay={120}>
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                      className={styles.input}
                      type="email"
                      aria-label={t("homepage:newsletter.emailPlaceholder")}
                      placeholder={t("homepage:newsletter.emailPlaceholder")}
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <Button type="submit">
                      {t("homepage:newsletter.subscribeCta")}
                    </Button>
                  </form>
                </Reveal>
                <Reveal as="p" className={styles.note} delay={160}>
                  {t("homepage:newsletter.note")}
                </Reveal>
              </>
            )}
          </div>

          {/* The digest preview is a curated snapshot of fabricated member/event
              activity (from the static registry) presented as "this week's" issue.
              There is no live endpoint that supplies a real issue, so show it only
              in demo mode rather than parade invented activity to real visitors. */}
          {demoMode && (
            <Reveal className={styles.preview} delay={100}>
              {digestPreview.map((item) => (
                <div key={item.title} className={styles.item}>
                  <div className={styles.week}>{item.tag}</div>
                  <div>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemMeta}>{item.meta}</div>
                  </div>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
