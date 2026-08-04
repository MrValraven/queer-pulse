import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import type { InfoCard, Voice } from "./intersectionality.data";
import {
  FadeIn,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./IntersectionalityPage.module.css";

/** Skeleton placeholder that mirrors VoiceCard shape — same border-radius, padding, gap. */
export function VoiceCardSkeleton() {
  return (
    <div className={styles.voiceCard} aria-hidden>
      <div className={styles.vcTop}>
        <SkeletonAvatar size={48} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="60%" height={15} />
          <SkeletonLine width="80%" height={12} style={{ marginTop: 5 }} />
        </div>
      </div>
      <SkeletonLine width="100%" height={13} />
      <SkeletonLine width="95%" height={13} style={{ marginTop: 6 }} />
      <SkeletonLine width="80%" height={13} style={{ marginTop: 6 }} />
    </div>
  );
}

/** Skeleton placeholder that mirrors InfoCard shape. */
export function InfoCardSkeleton() {
  return (
    <div className={styles.infoCard} aria-hidden>
      <SkeletonLine width={80} height={11} />
      <SkeletonLine width="70%" height={19} style={{ marginTop: 4 }} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 8 }} />
      <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
      <SkeletonLine width="75%" height={13} style={{ marginTop: 6 }} />
    </div>
  );
}

export function VoiceCard({ v }: { v: Voice }) {
  return (
    <div className={styles.voiceCard}>
      <div className={styles.vcTop}>
        <div
          className={styles.vcAv}
          style={{ background: v.background, color: v.color }}
        >
          {v.initials}
        </div>
        <div>
          <div className={styles.vcName}>{v.name}</div>
          <div className={styles.vcContext}>{v.context}</div>
        </div>
      </div>
      <p className={styles.vcQuote}>{v.quote}</p>
    </div>
  );
}

interface InfoCardsProps {
  cards: InfoCard[];
  /** While true, renders skeletons matching the card count. */
  loading?: boolean;
  /** When true, wraps each card in FadeIn for entrance stagger. */
  animate?: boolean;
}

export function InfoCards({ cards, loading, animate }: InfoCardsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.infoGrid}>
      {loading
        ? cards.map((_, i) => <InfoCardSkeleton key={i} />)
        : cards.map((card, i) => {
            const cardBody = (
              <div className={styles.infoCard}>
                <div className={styles.icEyebrow}>{t(card.eyebrowKey)}</div>
                <div className={styles.icTitle}>{t(card.titleKey)}</div>
                <div className={styles.icBody}>{t(card.bodyKey)}</div>
                {card.link && (
                  <div className={styles.icLink}>
                    <Link to={card.link.href}>
                      {t(card.link.labelKey)}{" "}
                      <FiArrowRight aria-hidden />
                    </Link>
                  </div>
                )}
              </div>
            );
            return animate ? (
              <FadeIn key={card.titleKey} delay={Math.min(i, 8) * 60}>
                {cardBody}
              </FadeIn>
            ) : (
              <Fragment key={card.titleKey}>{cardBody}</Fragment>
            );
          })}
    </div>
  );
}
