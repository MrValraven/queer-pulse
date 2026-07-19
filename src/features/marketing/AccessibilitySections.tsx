import { Button, FadeIn } from "../../shared/components/ui";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { COMMITMENTS, FILTERS, RESOURCES } from "./accessibility.data";
import {
  AccessibleVenueCard,
  AccessibleVenueCardSkeleton,
} from "./AccessibleVenueCard";
import type { Venue } from "./accessibility.data";
import styles from "./AccessibilityPage.module.css";

export function AccessibleSpacesSection({
  loading,
  filter,
  setFilter,
  venues,
  onFlag,
}: {
  loading: boolean;
  filter: string;
  setFilter: (f: string) => void;
  venues: Venue[];
  onFlag: (name: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec} id="spaces">
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            <Translation
              i18nKey="marketing:accessibility.spaces.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("marketing:accessibility.spaces.body")}</p>
        </div>
        <div className={styles.venueFilter}>
          <span className={styles.vfLabel}>
            {t("marketing:accessibility.spaces.filterLabel")}
          </span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.vfChip, filter === f.id && styles.vfChipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter(f.id)}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
        <div className={styles.venueGrid}>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <AccessibleVenueCardSkeleton key={index} />
            ))
          ) : venues.length === 0 ? (
            <div className={styles.venueEmpty}>
              <p>{t("marketing:accessibility.spaces.emptyTitle")}</p>
              <p className={styles.small}>
                {t("marketing:accessibility.spaces.emptyBody")}
              </p>
            </div>
          ) : (
            venues.map((v, i) => (
              <FadeIn key={v.name} delay={Math.min(i, 8) * 60}>
                <AccessibleVenueCard v={v} onFlag={() => onFlag(v.name)} />
              </FadeIn>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export function CommitmentsSection({
  onRequestAccom,
}: {
  onRequestAccom: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={`${styles.sec} ${styles.secAlt}`}>
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            <Translation
              i18nKey="marketing:accessibility.commitments.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("marketing:accessibility.commitments.body")}</p>
        </div>
        <div className={styles.commitGrid}>
          {COMMITMENTS.map((c) => (
            <div className={styles.commitCard} key={c.titleKey}>
              <div className={styles.ccIcon}>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="var(--jade)"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {c.icon}
                </svg>
              </div>
              <div className={styles.ccTitle}>{t(c.titleKey)}</div>
              <div className={styles.ccBody}>{t(c.bodyKey)}</div>
              <div className={styles.ccStatus}>{t(c.statusKey)}</div>
            </div>
          ))}
        </div>
        <div className={styles.accomStrip}>
          <div>
            <h3>{t("marketing:accessibility.commitments.accomTitle")}</h3>
            <p>{t("marketing:accessibility.commitments.accomBody")}</p>
          </div>
          <Button type="button" variant="primary" onClick={onRequestAccom}>
            {t("marketing:accessibility.commitments.accomCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ResourcesSection({
  showToast,
}: {
  showToast: ToastContextValue["showToast"];
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            <Translation
              i18nKey="marketing:accessibility.resources.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("marketing:accessibility.resources.body")}</p>
        </div>
        <div className={styles.resourceGrid}>
          {RESOURCES.map((r) => (
            <div className={styles.resourceCard} key={r.titleKey}>
              <div className={styles.rcEyebrow}>{t(r.eyebrowKey)}</div>
              <div className={styles.rcTitle}>{t(r.titleKey)}</div>
              <div className={styles.rcBody}>{t(r.bodyKey)}</div>
              <div className={styles.rcLink}>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      t("marketing:accessibility.resources.openingToast"),
                      "info",
                    )
                  }
                >
                  {t(r.linkKey)} →
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.peerStrip}>
          <div>
            <h3>
              <Translation
                i18nKey="marketing:accessibility.peer.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("marketing:accessibility.peer.body")}</p>
          </div>
          <div className={styles.peerActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                showToast(
                  t("marketing:accessibility.peer.joiningToast"),
                  "success",
                )
              }
            >
              {t("marketing:accessibility.peer.joinCta")}
            </Button>
            <Button to={routes.mentorship} variant="ghost-dark">
              {t("marketing:accessibility.peer.mentorCta")} →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
