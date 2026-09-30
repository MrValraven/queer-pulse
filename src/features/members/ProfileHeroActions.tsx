import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useMemberContact } from "../connect/useMemberContact";
import { useIncomingRequestActions } from "../connect/useIncomingRequestActions";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type MemberProfile } from "./data/memberProfiles";
import { ProfileHelloModal } from "./ProfileHelloModal";
import styles from "./ProfilePage.module.css";

/**
 * The primary + vouch action row in the profile hero, for anyone other than
 * the profile's owner (the owner's own actions live in `ProfileHeroToolbar`
 * now). Splits two ways: a preview of your profile "as a visitor" (the real
 * CTAs rendered inert), and the live view a real visitor gets (say-hello /
 * message + vouch).
 */
export function ProfileHeroActions({
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
  // PRD-03. When this member has already asked, the hero answers them instead
  // of offering to say hello into a request that would be refused.
  const { accept, decline, isAnswering } = useIncomingRequestActions(
    profile.slug,
    profile.first,
  );
  const { openVouch, hasVouched } = useVouch();
  const vouched = hasVouched(profile.slug);
  const [helloOpen, setHelloOpen] = useState(false);
  const fullName = `${profile.first} ${profile.last}`;

  // The reason-first "say hello" modal only applies to members you can
  // actually message directly (an accepted connection); `ProfileHelloModal`
  // sends it for real (PRD-338). A visitor who isn't connected yet still goes
  // through `contact()`'s existing connection-request flow (`ConnectModal`,
  // which already offers this same member's `openTo` entries as reasons)
  // rather than a message that could never actually be delivered.

  return (
    <>
      <div className={styles.cta}>
        {asVisitor ? (
          // Faithful preview of what a first-time visitor sees: the same
          // primary + vouch CTAs a real viewer gets, rendered inert so
          // preview mode doesn't leave an empty, misleading action row.
          <>
            <Button size="lg" disabled>
              {t("members:profile.hero.connectCta")}
            </Button>
            <Button size="lg" variant="ghost" disabled>
              {t("members:profile.hero.vouchForCta", {
                first: profile.first,
              })}
            </Button>
          </>
        ) : (
          <>
            {hasIncomingRequest ? (
              // They asked first. Two real answers, the same two the
              // connections page offers, so the request can be settled where
              // it is read.
              <>
                <Button
                  size="lg"
                  onClick={() => void accept()}
                  disabled={isAnswering}
                >
                  {t("members:profile.hero.acceptRequestCta", {
                    first: profile.first,
                  })}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => void decline()}
                  disabled={isAnswering}
                >
                  {t("members:profile.hero.declineRequestCta")}
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={() =>
                  connected
                    ? setHelloOpen(true)
                    : contact({ slug: profile.slug, name: fullName })
                }
              >
                {connected
                  ? t("connect:contact.message")
                  : t("members:profile.hero.connectCta")}
              </Button>
            )}
            {/* Vouching steps aside while a request is waiting: three large
                buttons is not an action row, and the vouch CTA comes straight
                back the moment the request is answered either way. */}
            {!realSelf &&
              !hasIncomingRequest &&
              (vouched ? (
                <span className={styles.vouchedTag}>
                  <FiCheck aria-hidden />{" "}
                  {t("members:profile.hero.vouchedFor", {
                    first: profile.first,
                  })}
                </span>
              ) : (
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => openVouch(profile.slug)}
                >
                  {t("members:profile.hero.vouchForCta", {
                    first: profile.first,
                  })}
                </Button>
              ))}
          </>
        )}
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
