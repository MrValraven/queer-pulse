import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import type { SignupRow } from "./api/volunteering.adapters";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { VolunteerSignupsCard } from "./VolunteerSignupsCard";
import { VolunteerSignupModal } from "./VolunteerSignupModal";
import { routes } from "../../app/routeMap";
import styles from "./VolunteerOpportunityPage.module.css";

const MEMBER = routes.members;
const MESSAGES = routes.messages;
const PARTNER = routes.partner;
const DONATE = routes.donate;

export function VolunteerOpportunitySidebar({
  opp,
  applied,
  submitting,
  apply,
  withdraw,
  withdrawing,
  error,
  isFull,
  isPoster,
  signups,
  signupsLoading,
  onCloseOpportunity,
  closing,
  closed,
  alternatives,
}: {
  opp: VolunteerOpportunity;
  applied: boolean;
  submitting: boolean;
  apply: (note: string) => void;
  withdraw: () => void;
  withdrawing: boolean;
  error: string | null;
  isFull: boolean;
  isPoster: boolean;
  signups: SignupRow[];
  signupsLoading: boolean;
  onCloseOpportunity: () => void;
  closing: boolean;
  closed: boolean;
  alternatives: VolunteerOpportunity[];
}) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const partnerTo = opp.partner?.slug
    ? `${routes.partners}/${opp.partner.slug}`
    : PARTNER;

  return (
    <aside className={styles.side}>
      {applied ? (
        <FadeIn className={styles.appliedCard}>
          <div className={styles.appliedIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--jade-soft)"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className={styles.appliedTitle}>
            <Translation
              i18nKey="marketing:volunteerDetail.sidebar.appliedTitle"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.appliedText}>{opp.applyConfirm}</p>
          <Button variant="ghost-dark" className={styles.ctaBtn} to={MESSAGES}>
            {t("marketing:volunteerDetail.sidebar.messageTeam")}
          </Button>
          <button
            type="button"
            className={styles.withdrawLink}
            onClick={withdraw}
            disabled={withdrawing}
            aria-busy={withdrawing}
          >
            {withdrawing
              ? t("marketing:volunteerDetail.sidebar.withdrawing")
              : t("marketing:volunteerDetail.sidebar.withdraw")}
          </button>
        </FadeIn>
      ) : (
        <div className={styles.card}>
          <div className={styles.applyHead}>
            <h4>{t("marketing:volunteerDetail.sidebar.applyHeading")}</h4>
            <div className={styles.role}>{opp.applyRole}</div>
          </div>
          <div className={styles.spotsRow}>
            <span>{t("marketing:volunteerDetail.sidebar.spotsFilled")}</span>
            <b>{opp.spotsFilled}</b>
          </div>
          <div className={styles.spotsBar}>
            <span style={{ width: `${opp.spotsPct}%` }} />
          </div>
          {opp.spots.map((r) => (
            <div className={styles.spotsRow} key={r.label}>
              <span>{r.label}</span>
              {typeof r.value === "string" ? <b>{r.value}</b> : r.value}
            </div>
          ))}
          <div className={styles.cta}>
            <Button
              variant="primary"
              className={styles.ctaBtn}
              onClick={() => setModalOpen(true)}
              disabled={submitting || isFull}
              aria-busy={submitting}
            >
              {isFull
                ? t("marketing:volunteerDetail.sidebar.roleFull")
                : submitting
                  ? t("marketing:volunteerDetail.sidebar.sending")
                  : t("marketing:volunteerDetail.sidebar.applyCta")}
              {!isFull && !submitting && <FiArrowRight aria-hidden />}
            </Button>
            <Button variant="ghost" className={styles.ctaBtn} to={MESSAGES}>
              {t("marketing:volunteerDetail.sidebar.askTeam")}
            </Button>
          </div>
          {modalOpen && (
            <VolunteerSignupModal
              applyRole={opp.applyRole}
              submitting={submitting}
              error={error}
              onClose={() => setModalOpen(false)}
              onSubmit={(note) => apply(note)}
            />
          )}
          <p className={styles.footNote}>
            <Translation
              i18nKey="marketing:volunteerDetail.sidebar.footNote"
              components={{ a: <Link to={MEMBER} /> }}
            />
          </p>
        </div>
      )}

      {isPoster && (
        <VolunteerSignupsCard
          signups={signups}
          loading={signupsLoading}
          onClose={onCloseOpportunity}
          closing={closing}
          closed={closed}
          opportunitySlug={opp.slug}
        />
      )}

      {opp.partner && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            {t("marketing:volunteerDetail.sidebar.partnershipLabel")}
          </div>
          <span className={styles.partnerPill}>{opp.partner.name}</span>
          <p className={styles.partnerText}>{opp.partner.text}</p>
          <Link to={partnerTo} className={styles.partnerLink}>
            {t("marketing:volunteerDetail.sidebar.partnershipLink")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardLabel}>
          {t("marketing:volunteerDetail.sidebar.notRightFit")}
        </div>
        <p className={styles.altText}>
          {t("marketing:volunteerDetail.sidebar.otherWays")}
        </p>
        <div className={styles.altList}>
          {alternatives.map((a) => (
            <Link key={a.slug} to={`${routes.volunteer}/opportunity/${a.slug}`}>
              <FiArrowRight aria-hidden /> {a.role} · {a.org}
            </Link>
          ))}
          <Link to={DONATE}>
            <FiArrowRight aria-hidden />{" "}
            {t("marketing:volunteerDetail.sidebar.fundInstead")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
