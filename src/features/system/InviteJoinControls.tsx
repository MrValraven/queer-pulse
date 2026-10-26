import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useIsEmailCodeSignInOn } from "../../shared/api/useIsEmailCodeSignInOn";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AgeAttestation } from "../auth/AgeAttestation";
import { InviteEmailCodeJoin } from "./InviteEmailCodeJoin";
import styles from "./InviteLandingPage.module.css";

/** The 18+ checkbox; the under-18 notice's back button refocuses it. */
export const AGE_ATTESTATION_ID = "invite-age-attestation";

export interface InviteJoinControlsProps {
  inviteCode: string;
  /** Whether the 18+ box is ticked; gates both ways of joining. */
  is18: boolean;
  onIs18Change: (value: boolean) => void;
  onUnder18: () => void;
  onGoogle: () => void;
  onEmailJoined: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

/** The sign-up controls on the opened invitation: the 18+ box, Google, the
 *  email code option (only while the platform status says it is switched
 *  on), the consent note and the way back for members. */
export function InviteJoinControls({
  inviteCode,
  is18,
  onIs18Change,
  onUnder18,
  onGoogle,
  onEmailJoined,
  onOpenTerms,
  onOpenPrivacy,
}: InviteJoinControlsProps) {
  const { t } = useTranslation();
  const isEmailCodeOn = useIsEmailCodeSignInOn();
  return (
    <>
      <AgeAttestation
        id={AGE_ATTESTATION_ID}
        confirmed={is18}
        onConfirmedChange={onIs18Change}
        onUnder18={onUnder18}
      />

      <button
        type="button"
        className={styles.google}
        onClick={onGoogle}
        disabled={!is18}
        aria-disabled={!is18}
      >
        {/* Official Google "G" logo, via react-icons' <FcGoogle>: the
          same mark SignInPage uses. Its four brand fills are baked into
          the icon, which is what Google's branding guidelines require and
          what no design token could supply. Sized by `.google svg`. */}
        <FcGoogle aria-hidden />
        {t("system:inviteLanding.card.googleCta")}
      </button>

      {/* Hidden until the status says the codes are on, then it opens in.
          The option's top margin sits inside Collapse's flow-root wrapper. */}
      <Collapse isOpen={isEmailCodeOn}>
        <InviteEmailCodeJoin
          inviteCode={inviteCode}
          is18={is18}
          onEmailJoined={onEmailJoined}
        />
      </Collapse>

      <p className={styles.consentNote}>
        <Translation
          i18nKey="system:inviteLanding.card.consent"
          components={{
            // eslint-disable-next-line jsx-a11y/control-has-associated-label -- false positive: an element template for <Translation>, which clones it with the translated children (its accessible name) at render.
            termsLink: <button type="button" onClick={onOpenTerms} />,
            privacyLink: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label -- same as above.
              <button type="button" onClick={onOpenPrivacy} />
            ),
          }}
        />
      </p>

      <p className={styles.alreadyMember}>
        <Translation
          i18nKey="system:inviteLanding.card.alreadyMember"
          components={{ a: <Link to={routes.signIn} /> }}
        />
      </p>
    </>
  );
}
