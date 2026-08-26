import { AppShell } from "../../shared/components/layout";
import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MEANS } from "./vouch.data";
import { VouchMemberPicker } from "./VouchMemberPicker";
import styles from "./VouchPage.module.css";

/**
 * `/vouch` — "vouch for someone", the standing entry point into the vouch
 * flow.
 *
 * This page used to be a demo prototype: one hardcoded candidate, a submit
 * that called nothing, and an `EmptyState` in live mode. It is now a real
 * member picker over the real directory, handing the chosen member to
 * `VouchMemberModal`, which posts to `POST /members/:slug/vouch`. Rebuilt
 * rather than deleted because the endpoint and the form both already existed
 * and worked: the only thing missing was a way in for a member who knows they
 * want to vouch for someone but is not currently looking at that person's
 * profile.
 *
 * `AppShell`, not `PageShell`: vouching is a members-only action, so this is a
 * signed-in surface rather than a marketing one.
 */
export function VouchPage() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.inner}>
            <Reveal className={styles.eyebrow}>
              {t("members:vouch.page.eyebrow")}
            </Reveal>
            <Reveal as="h1" className={styles.title} delay={60}>
              <Translation
                i18nKey="members:vouch.page.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.lede} delay={90}>
              {t("members:vouch.page.lede")}
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
                    <div className={styles.meanTitle}>{t(mean.titleKey)}</div>
                    <div className={styles.meanBody}>{t(mean.bodyKey)}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <VouchMemberPicker />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
