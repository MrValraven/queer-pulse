import { useState, type FormEvent } from "react";
import { FiCheck, FiShield } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Avatar, Button, EmptyState, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CANDIDATE, MEANS } from "./vouch.data";
import styles from "./VouchPage.module.css";

export function VouchPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const candidateFirstName = CANDIDATE.name.split(" ")[0]!;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
    showToast(t("members:vouch.page.toast", { name: CANDIDATE.name }));
  }

  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.inner}>
            {!demoMode ? (
              <EmptyState
                icon={<FiShield />}
                title={t("members:vouch.page.emptyLive.title")}
                description={t("members:vouch.page.emptyLive.description")}
                action={{
                  label: t("members:vouch.page.emptyLive.cta"),
                  to: routes.members,
                }}
              />
            ) : sent ? (
              <Reveal className={styles.panel}>
                <div className={styles.panelIcon}>
                  <FiCheck />
                </div>
                <h1 className={styles.panelTitle}>
                  <Translation
                    i18nKey="members:vouch.page.success.title"
                    components={{ em: <em /> }}
                  />
                </h1>
                <p className={styles.panelSub}>
                  {t("members:vouch.page.success.body", {
                    name: CANDIDATE.name,
                  })}
                </p>
                <div className={styles.panelActions}>
                  <Button
                    to={routes.connections}
                    variant="ghost-dark"
                    size="lg"
                  >
                    {t("members:vouch.page.success.connectionsCta")}
                  </Button>
                  <Button to={routes.members} variant="jade" size="lg">
                    {t("members:vouch.page.success.browseCta")}
                  </Button>
                </div>
              </Reveal>
            ) : (
              <>
                <Reveal className={styles.eyebrow}>
                  {t("members:vouch.page.eyebrow")}
                </Reveal>
                <Reveal as="h1" className={styles.title} delay={60}>
                  <Translation
                    i18nKey="members:vouch.page.title"
                    components={{ em: <em /> }}
                  />
                </Reveal>

                <Reveal className={styles.candidate} delay={120}>
                  <Avatar
                    initials={CANDIDATE.initials}
                    tint={CANDIDATE.tint}
                    size={56}
                  />
                  <div>
                    <div className={styles.candName}>{CANDIDATE.name}</div>
                    <div className={styles.candContext}>
                      {CANDIDATE.context}
                    </div>
                    <div className={styles.candBio}>{CANDIDATE.bio}</div>
                  </div>
                </Reveal>

                <div className={styles.means}>
                  {MEANS.map((mean, index) => (
                    <Reveal
                      key={mean.titleKey}
                      className={styles.mean}
                      delay={index * 50}
                    >
                      <span className={styles.meanIcon}>
                        <mean.icon />
                      </span>
                      <div>
                        <div className={styles.meanTitle}>
                          {t(mean.titleKey)}
                        </div>
                        <div className={styles.meanBody}>{t(mean.bodyKey)}</div>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <Reveal as="form" delay={120} onSubmit={handleSubmit}>
                  <label className={styles.label} htmlFor="vouch-note">
                    {t("members:vouch.page.noteLabel")}
                  </label>
                  <textarea
                    id="vouch-note"
                    className={styles.textarea}
                    placeholder={t("members:vouch.page.notePlaceholder", {
                      name: candidateFirstName,
                    })}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                  <div className={styles.actions}>
                    <Button type="submit" variant="primary" size="lg">
                      {t("members:vouch.page.submitCta")}
                    </Button>
                    <Button to={routes.members} variant="ghost" size="lg">
                      {t("members:vouch.page.skipCta")}
                    </Button>
                  </div>
                </Reveal>
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
