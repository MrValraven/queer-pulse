import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import type { Person } from "../../shared/api/refs";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import type { SignupRow } from "./api/volunteering.adapters";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMemberContact } from "../connect/useMemberContact";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { VolunteerSignupsCard } from "./VolunteerSignupsCard";
import { VolunteerSignupModal } from "./VolunteerSignupModal";
import { VolunteerOrganizationCard } from "./VolunteerOrganizationCard";
import { routes } from "../../app/routeMap";
import styles from "./VolunteerOpportunityPage.module.css";

const MEMBER = routes.members;
const MESSAGES = routes.messages;
const SIGN_IN = routes.signIn;

/**
 * PRD-262. "Message the team" / "Ask the team", pointed at the member who
 * actually posted the opportunity instead of the bare inbox: an accepted
 * volunteer's next question ("where do I turn up, who do I ask") now lands in
 * a thread with someone who can answer it.
 *
 * Goes through `useMemberContact`, the same idiom every other "message this
 * member" CTA in the app uses, so an accepted connection opens the thread and
 * anyone else gets the connection request flow rather than a message that
 * could never be delivered. Its own component so that hook sits at a component
 * top level (mirrors `RosterTab`'s `MemberContactAction`).
 *
 * Renders nothing when there is nobody to address: a signed-out reader, an
 * erased poster, or the reader BEING the poster (belt and braces — the poster
 * is always inside `canReviewApplicants`, which suppresses this whole block).
 * Demo mode is the one fallback to the plain inbox: the mock registry has no
 * poster records at all, and the prototype inbox it lands in is populated.
 */
function PosterContactCta({
  poster,
  isSignedIn,
  variant,
  messageLabel,
}: {
  poster: Person | null;
  isSignedIn: boolean;
  variant: "ghost" | "ghost-dark";
  messageLabel: string;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const viewerSlug = user?.profile?.slug ?? null;
  const contactablePoster =
    poster && poster.slug !== viewerSlug ? poster : null;
  const { connected, contact } = useMemberContact(
    contactablePoster?.slug ?? "",
  );

  if (isSignedIn && contactablePoster) {
    return (
      <Button
        variant={variant}
        className={styles.ctaBtn}
        onClick={() =>
          contact({
            slug: contactablePoster.slug,
            name: contactablePoster.name,
          })
        }
      >
        {connected
          ? messageLabel
          : t("marketing:volunteerDetail.sidebar.connectToMessage")}
      </Button>
    );
  }
  if (demoMode) {
    return (
      <Button variant={variant} className={styles.ctaBtn} to={MESSAGES}>
        {messageLabel}
      </Button>
    );
  }
  return null;
}

export function VolunteerOpportunitySidebar({
  opp,
  applied,
  submitting,
  apply,
  withdraw,
  withdrawing,
  error,
  isFull,
  canReviewApplicants,
  canEditOpportunity,
  poster,
  isSignedIn,
  signups,
  signupsLoading,
  onCloseOpportunity,
  closing,
  closed,
  onEdit,
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
  /**
   * PRD-268. The applicant-review tier: the poster, OR an owner/mod of the
   * community this opportunity is attributed to. Reveals the roster card and
   * the manage-applicants entry point, and suppresses the apply/applied block
   * — an organiser reviewing their own community's posting is not an applicant
   * to it. Resolved server-side by the same predicate the roster and
   * accept/decline routes guard on.
   */
  canReviewApplicants: boolean;
  /** Poster-only, so a community organiser who reviews applicants is still not
   *  offered edit or close. */
  canEditOpportunity: boolean;
  /**
   * The member who posted this opportunity, so "message the team" opens a real
   * conversation with them. `null` when the API carried no poster (erased) and
   * in demo mode, whose mock registry has no ownership records.
   */
  poster: Person | null;
  /**
   * Whether the reader has a session. The opportunity itself is public
   * (PRD-260) so anyone can read what the platform needs help with, but
   * applying is a member-only write. False here swaps the apply control for a
   * sign-in link instead of firing a 401 the reader cannot act on.
   */
  isSignedIn: boolean;
  signups: SignupRow[];
  signupsLoading: boolean;
  onCloseOpportunity: () => void;
  closing: boolean;
  closed: boolean;
  onEdit: () => void;
  alternatives: VolunteerOpportunity[];
}) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <aside className={styles.side}>
      {canReviewApplicants ? null : applied ? (
        <FadeIn className={styles.appliedCard}>
          <div className={styles.appliedIcon}>
            <FiCheck aria-hidden />
          </div>
          <div className={styles.appliedTitle}>
            <Translation
              i18nKey="marketing:volunteerDetail.sidebar.appliedTitle"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.appliedText}>{opp.applyConfirm}</p>
          <PosterContactCta
            poster={poster}
            isSignedIn={isSignedIn}
            variant="ghost-dark"
            messageLabel={t("marketing:volunteerDetail.sidebar.messageTeam")}
          />
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
            {isSignedIn ? (
              <>
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
                <PosterContactCta
                  poster={poster}
                  isSignedIn={isSignedIn}
                  variant="ghost"
                  messageLabel={t("marketing:volunteerDetail.sidebar.askTeam")}
                />
              </>
            ) : (
              // Signed out: the role, the spots and the whole page stay
              // readable — that is the point of the public detail — but the
              // two member-only actions become one honest invitation.
              <Button variant="primary" className={styles.ctaBtn} to={SIGN_IN}>
                {t("marketing:volunteerDetail.sidebar.signInToApply")}
                <FiArrowRight aria-hidden />
              </Button>
            )}
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

      {canEditOpportunity && (
        <Button variant="ghost" className={styles.ctaBtn} onClick={onEdit}>
          {t("marketing:volunteerDetail.sidebar.editCta")}
        </Button>
      )}

      {canReviewApplicants && (
        <VolunteerSignupsCard
          signups={signups}
          loading={signupsLoading}
          onClose={onCloseOpportunity}
          closing={closing}
          closed={closed}
          canCloseOpportunity={canEditOpportunity}
          opportunitySlug={opp.slug}
        />
      )}

      <VolunteerOrganizationCard opp={opp} />

      {alternatives.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            {t("marketing:volunteerDetail.sidebar.notRightFit")}
          </div>
          <p className={styles.altText}>
            {t("marketing:volunteerDetail.sidebar.otherWays")}
          </p>
          <div className={styles.altList}>
            {alternatives.map((a) => (
              <Link
                key={a.slug}
                to={`${routes.volunteer}/opportunity/${a.slug}`}
              >
                <FiArrowRight aria-hidden /> {a.role} · {a.org}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
