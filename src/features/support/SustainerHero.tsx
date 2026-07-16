import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCountUp } from "../../shared/hooks";
import { useAnimatedFill } from "./useAnimatedFill";
import { HERO_AVATARS, HERO_CHIP_KEYS } from "./sustainer.data";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

export function SustainerHero({
  store,
  onChooseAmount,
  onSeeBudget,
}: {
  store: SustainerStore;
  onChooseAmount: () => void;
  onSeeBudget: () => void;
}) {
  const { t } = useTranslation();
  const count = useCountUp(store.count);
  const pct = Math.min(100, Math.round((store.count / store.goal) * 100));
  const fill = useAnimatedFill(pct);

  return (
    <section className={styles.susHero}>
      <div className={`wrap ${styles.heroWrap}`}>
        <div>
          <div className={styles.heroEyebrow}>{t("support:hero.eyebrow")}</div>
          <h1 className={styles.heroTitle}>
            <Translation
              i18nKey="support:hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.heroSub}>{t("support:hero.sub")}</p>
          <div className={styles.heroCtaRow}>
            <Button variant="primary" size="lg" onClick={onChooseAmount}>
              {t("support:hero.chooseAmountCta")}
            </Button>
            <Button variant="ghost-dark" onClick={onSeeBudget}>
              {t("support:hero.seeBudgetCta")}
            </Button>
          </div>
          <div className={styles.heroChips}>
            {HERO_CHIP_KEYS.map((key) => (
              <span key={key} className={styles.heroChip}>
                {t(key)}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.heroProof}>
          <div className={styles.hpLive}>
            <span className={styles.dot} />
            {t("support:hero.supportingNow")}
          </div>
          <div className={styles.hpCount}>{count}</div>
          <div className={styles.hpCountLabel}>
            {t("support:hero.supportingMembersLabel")}
          </div>
          <div className={styles.hpAvs}>
            {HERO_AVATARS.map((a) => (
              <div
                key={a.initials}
                className={styles.hpAv}
                style={{ background: a.bg, color: a.fg }}
              >
                {a.initials}
              </div>
            ))}
            <div
              className={styles.hpAv}
              style={{
                background: "rgba(247,243,238,.14)",
                color: "var(--cream)",
              }}
            >
              +{store.count - HERO_AVATARS.length}
            </div>
          </div>
          <div className={styles.progTrack}>
            <div className={styles.progFill} style={{ width: `${fill}%` }} />
          </div>
          <div className={styles.progLabelSmall}>
            <strong>
              {t("support:hero.progressCount", {
                count: store.count,
                goal: store.goal,
              })}
            </strong>{" "}
            {t("support:hero.toBreakEven")}
          </div>
          <div className={styles.hpActivity}>
            <FiArrowRight aria-hidden style={{ transform: "rotate(-90deg)" }} />
            {t("support:hero.joinedThisWeek", { count: 3 })}
          </div>
        </div>
      </div>
    </section>
  );
}
