import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiEdit3, FiEye } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type MemberProfile } from "./data/memberProfiles";
import { ProfileHelloModal } from "./ProfileHelloModal";
import styles from "./ProfilePage.module.css";

/**
 * The primary + vouch action row in the profile hero. Splits three ways: your
 * own profile (edit / preview), a preview of your profile "as a visitor" (the
 * real CTAs rendered inert), and the live view a real visitor gets (say-hello /
 * message + vouch / withdraw-vouch).
 */
export function ProfileHeroActions({
  profile,
  isSelf,
  asVisitor,
  realSelf,
  onEdit,
  onPreview,
}: {
  profile: MemberProfile;
  isSelf: boolean;
  asVisitor: boolean;
  realSelf: boolean;
  onEdit?: () => void;
  onPreview?: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { connected, contact } = useMemberContact(profile.slug);
  const { openVouch, hasVouched } = useVouch();
  const vouched = hasVouched(profile.slug);
  const [helloOpen, setHelloOpen] = useState(false);
  const fullName = `${profile.first} ${profile.last}`;

  // The reason-first "say hello" modal only applies to members you can
  // actually message directly (an accepted connection) — it hands off to the
  // same real "deep-link into the compose flow with a prefilled draft" entry
  // point every other "message this person" CTA in the app already uses (see
  // ConnectionsPage.tsx / the myevents "message host" CTA): navigate to
  // `routes.messages` with `state.to.text`, which seeds the composer's draft
  // for the member to review before they actually hit send. A visitor who
  // isn't connected yet still goes through `contact()`'s existing
  // connection-request flow (`ConnectModal`, which already offers this same
  // member's `openTo` entries as reasons) rather than a message that could
  // never actually be delivered.
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

  return (
    <>
      <div className={styles.cta}>
        {isSelf ? (
          <>
            <Button id="profileEditCta" size="lg" onClick={onEdit}>
              <FiEdit3 aria-hidden /> {t("members:profile.hero.editCta")}
            </Button>
            <Button size="lg" variant="ghost" onClick={onPreview}>
              <FiEye aria-hidden /> {t("members:profile.hero.previewCta")}
            </Button>
          </>
        ) : asVisitor ? (
          // Faithful preview of what a first-time visitor sees — the same
          // primary + vouch CTAs a real viewer gets, rendered inert so
          // preview mode doesn't leave an empty, misleading action row.
          <>
            <Button size="lg" disabled>
              {t("members:profile.hero.sayHelloCta")}
            </Button>
            <Button size="lg" variant="ghost" disabled>
              {t("members:profile.hero.vouchForCta", {
                first: profile.first,
              })}
            </Button>
          </>
        ) : (
          <>
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
            {!realSelf &&
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
          onSend={handleSendHello}
        />
      )}
    </>
  );
}
