import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ProfileSafetyMenu } from "./ProfileSafetyMenu";
import type { MemberProfile } from "./data/memberProfiles";
import styles from "./MobileProfile.module.css";

/**
 * Visitor action cluster for the mobile member profile: a full-width primary
 * ("Say hello" / "Request intro") over a compact second row holding the vouch
 * control and the "…" safety menu. Mirrors the live-visitor data branch of the
 * desktop-shared `ProfileHeroActions` (same hooks, same gating) but arranged
 * for the narrow column; `asVisitor` renders the CTAs inert so the owner's
 * "preview as a visitor" mode shows the real shape without live side effects.
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
  const { connected, contact } = useMemberContact(profile.slug);
  const { openVouch, hasVouched, removeVouch } = useVouch();
  const isPrivate = profile.visibility === "private";
  const vouched = hasVouched(profile.slug);

  const primary = asVisitor ? (
    isPrivate ? (
      <Button size="lg" variant="ghost" disabled>
        {t("members:profile.hero.requestIntroCta")}
      </Button>
    ) : (
      <Button size="lg" disabled>
        {t("members:profile.hero.sayHelloCta")}
      </Button>
    )
  ) : isPrivate ? (
    <Button size="lg" variant="ghost" to={routes.invite}>
      {t("members:profile.hero.requestIntroCta")}
    </Button>
  ) : (
    <Button
      size="lg"
      onClick={() =>
        contact({
          slug: profile.slug,
          name: `${profile.first} ${profile.last}`,
        })
      }
    >
      {connected
        ? t("connect:contact.message")
        : t("members:profile.hero.sayHelloCta")}
    </Button>
  );

  return (
    <div className={styles.actionStack}>
      <div className={styles.primaryRow}>{primary}</div>
      <div className={styles.secondaryRow}>
        {vouched ? (
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
  );
}
