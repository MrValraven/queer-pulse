import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./SubmitStoryPage.module.css";

/** Two weeks from "now". */
function replyByDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d;
}

export function SubmitStorySuccess({ working }: { working: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const title = working || t("magazine:submitStory.success.defaultTitle");

  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <Reveal className={styles.panel}>
            <div className={styles.panelIcon}>
              <FiCheck />
            </div>
            <h1 className={styles.panelTitle}>
              <Translation
                i18nKey="magazine:submitStory.success.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.panelSub}>
              {t("magazine:submitStory.success.sub", { title })}
            </p>
            <div className={styles.timeline}>
              <div className={styles.timelineRow}>
                <span className={styles.timelineDot} />
                <span>
                  {t("magazine:submitStory.success.timeline.readsEvery")}
                </span>
              </div>
              <div className={styles.timelineRow}>
                <span
                  className={[styles.timelineDot, styles.timelineDotKey].join(
                    " ",
                  )}
                />
                <span>
                  <Translation
                    i18nKey="magazine:submitStory.success.timeline.hearBy"
                    components={{ strong: <strong /> }}
                    values={{
                      date: fmt.date(replyByDate(), {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    }}
                  />
                </span>
              </div>
              <div className={styles.timelineRow}>
                <span className={styles.timelineDot} />
                <span>{t("magazine:submitStory.success.timeline.ifYes")}</span>
              </div>
            </div>
            <div className={styles.panelActions}>
              <Button to={routes.magazine} variant="ghost-dark" size="lg">
                {t("magazine:submitStory.success.backCta")}
              </Button>
              <Button to={routes.issues} variant="jade" size="lg">
                {t("magazine:submitStory.success.pastIssuesCta")}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
