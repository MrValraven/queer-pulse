import { FiCheck, FiEdit3, FiEye, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type MemberProfile } from "./data/memberProfiles";
import styles from "./ProfilePage.module.css";

/**
 * The primary + vouch action row in the profile hero. Splits three ways: your
 * own profile (edit / preview), a preview of your profile "as a visitor" (the
 * real CTAs rendered inert), and the live view a real visitor gets (say-hello /
 * request-intro + vouch / withdraw-vouch).
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
  const { connected, contact } = useMemberContact(profile.slug);
  const { openVouch, hasVouched, removeVouch } = useVouch();
  const vouched = hasVouched(profile.slug);
  return (
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
          {profile.visibility === "private" ? (
            <Button size="lg" variant="ghost" disabled>
              {t("members:profile.hero.requestIntroCta")}
            </Button>
          ) : (
            <Button size="lg" disabled>
              {t("members:profile.hero.sayHelloCta")}
            </Button>
          )}
          <Button size="lg" variant="ghost" disabled>
            {t("members:profile.hero.vouchForCta", {
              first: profile.first,
            })}
          </Button>
        </>
      ) : (
        <>
          {profile.visibility === "private" ? (
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
          )}
          {!realSelf &&
            (vouched ? (
              <span className={styles.vouchedActions}>
                <span className={styles.vouchedTag}>
                  <FiCheck aria-hidden />{" "}
                  {t("members:profile.hero.vouchedFor", {
                    first: profile.first,
                  })}
                </span>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => removeVouch(profile.slug)}
                >
                  <FiX aria-hidden />{" "}
                  {t("members:profile.hero.withdrawVouchCta")}
                </Button>
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
  );
}
