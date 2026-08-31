import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import { useIncomingRequestActions } from "../connect/useIncomingRequestActions";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";
import { ProfileHelloModal } from "./ProfileHelloModal";
import type { MemberProfile } from "./data/memberProfiles";
import styles from "./MobileProfile.module.css";

/**
 * Visitor action cluster for the mobile member profile: a full-width primary
 * ("Say hello" / "Message") over a compact second row holding the vouch
 * control and the "…" safety menu. Mirrors the live-visitor data branch of the
 * desktop-shared `ProfileHeroActions` (same hooks, same "say hello" modal for
 * connected members) but arranged for the narrow column; `asVisitor` renders
 * the CTAs inert so the owner's "preview as a visitor" mode shows the real
 * shape without live side effects.
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
  const navigate = useNavigate();
  const { showToast } = useToast();
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

  function handleSendHello(draft: string) {
    try {
      void navigate(routes.messages, {
        state: { to: { slug: profile.slug, name: fullName, text: draft } },
      });
      setHelloOpen(false);
      showToast(
        t("members:profile.hello.sentToast", { first: profile.first }),
        "success",
      );
    } catch {
      showToast(t("members:profile.hello.errorToast"), "error");
    }
  }

  const primary = asVisitor ? (
    <Button size="lg" disabled>
      {t("members:profile.hero.sayHelloCta")}
    </Button>
  ) : hasIncomingRequest ? (
    // They asked first: the primary answers them. Decline sits in the second
    // row below, where this layout already keeps its secondary controls.
    <Button size="lg" onClick={() => void accept()} disabled={isAnswering}>
      {t("members:profile.hero.acceptRequestCta", { first: profile.first })}
    </Button>
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
        : t("members:profile.hero.sayHelloCta")}
    </Button>
  );

  return (
    <>
      <div className={styles.actionStack}>
        <div className={styles.primaryRow}>{primary}</div>
        <div className={styles.secondaryRow}>
          {hasIncomingRequest && !asVisitor ? (
            <Button
              size="lg"
              variant="ghost"
              onClick={() => void decline()}
              disabled={isAnswering}
            >
              {t("members:profile.hero.declineRequestCta")}
            </Button>
          ) : vouched ? (
            <span className={styles.vouchedPill}>
              <FiCheck aria-hidden />
              {t("members:profile.hero.vouchedShort")}
            </span>
          ) : (
            <Button
              size="lg"
              variant="ghost"
              disabled={asVisitor}
              onClick={asVisitor ? undefined : () => openVouch(profile.slug)}
            >
              {t("members:profile.hero.vouchForCta", { first: profile.first })}
            </Button>
          )}
          {!realSelf && (
            <ProfileSafetyMenu
              slug={profile.slug}
              firstName={profile.first}
              onWithdrawVouch={
                vouched ? () => removeVouch(profile.slug) : undefined
              }
            />
          )}
        </div>
      </div>
      {helloOpen && (
        <ProfileHelloModal
          profile={profile}
          onClose={() => setHelloOpen(false)}
          onSend={handleSendHello}
        />
      )}
    </>
  );
}
