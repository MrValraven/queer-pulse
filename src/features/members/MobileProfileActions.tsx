import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useMemberContact } from "../connect/useMemberContact";
import { useIncomingRequestActions } from "../connect/useIncomingRequestActions";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";
import { ProfileHelloModal } from "./ProfileHelloModal";
import type { MemberProfile } from "./data/memberProfiles";
import styles from "./MobileProfile.module.css";

/**
 * Visitor action cluster for the mobile member profile: the primary CTA
 * ("Say hello" / "Message" / "Accept") and the secondary control (Vouch /
 * Decline / the vouched pill) side by side at equal width, with the "…"
 * safety menu as a quiet 44px icon at the end of the same row. Mirrors the
 * live-visitor data branch of the desktop's `ProfileHeroActions` (same
 * hooks, same "say hello" modal for connected members), but as its own
 * component arranged for the narrow column; `asVisitor` renders the CTAs
 * inert so the owner's "preview as a visitor" mode shows the real shape
 * without live side effects.
 *
 * Buttons carry short labels (11 characters at most in either language) so
 * each half fits one line at 375px; where the short label drops the name,
 * the full wording stays on as the accessible name.
 */
export function MobileProfileActions({
  profile,
  asVisitor,
  realSelf,
}: {
  profile: MemberProfile;
  asVisitor: boolean;
  realSelf: boolean;
}) {
  const { t } = useTranslation();
  const { connected, hasIncomingRequest, contact } = useMemberContact(
    profile.slug,
  );
  // PRD-03, the same three states the desktop hero branches on.
  const { accept, decline, isAnswering } = useIncomingRequestActions(
    profile.slug,
    profile.first,
  );
  const { openVouch, hasVouched, removeVouch } = useVouch();
  const vouched = hasVouched(profile.slug);
  const [helloOpen, setHelloOpen] = useState(false);
  const fullName = `${profile.first} ${profile.last}`;
  const acceptLabel = t("members:profile.hero.acceptRequestCta", {
    first: profile.first,
  });
  const vouchLabel = t("members:profile.hero.vouchForCta", {
    first: profile.first,
  });

  const primary = asVisitor ? (
    <Button size="md" className={styles.actionButton} disabled>
      {t("members:profile.hero.sayHelloCta")}
    </Button>
  ) : hasIncomingRequest ? (
    // They asked first: the primary answers them. Decline sits beside it,
    // where this layout already keeps its secondary control.
    <Button
      size="md"
      className={styles.actionButton}
      aria-label={acceptLabel}
      onClick={() => void accept()}
      disabled={isAnswering}
    >
      {t("connect:card.accept")}
    </Button>
  ) : (
    <Button
      size="md"
      className={styles.actionButton}
      onClick={() =>
        connected
          ? setHelloOpen(true)
          : contact({ slug: profile.slug, name: fullName })
      }
    >
      {connected
        ? t("connect:contact.message")
        : t("members:profile.hero.sayHelloCta")}
    </Button>
  );

  const secondary =
    hasIncomingRequest && !asVisitor ? (
      <Button
        size="md"
        variant="ghost"
        className={styles.actionButton}
        onClick={() => void decline()}
        disabled={isAnswering}
      >
        {t("connect:card.decline")}
      </Button>
    ) : vouched ? (
      <span className={`${styles.vouchedPill} ${styles.actionButton}`}>
        <FiCheck aria-hidden />
        {t("members:profile.hero.vouchedShort")}
      </span>
    ) : (
      <Button
        size="md"
        variant="ghost"
        className={styles.actionButton}
        aria-label={vouchLabel}
        disabled={asVisitor}
        onClick={asVisitor ? undefined : () => openVouch(profile.slug)}
      >
        {t("members:profile.hero.vouchShort")}
      </Button>
    );

  const safetyMenu = !realSelf && (
    <ProfileSafetyMenu
      slug={profile.slug}
      firstName={profile.first}
      onWithdrawVouch={
        vouched
          ? (onSettled) => removeVouch(profile.slug, onSettled)
          : undefined
      }
    />
  );

  return (
    <>
      <div className={styles.actionRow}>
        {primary}
        {secondary}
        {safetyMenu}
      </div>
      {helloOpen && (
        <ProfileHelloModal
          profile={profile}
          onClose={() => setHelloOpen(false)}
        />
      )}
    </>
  );
}
