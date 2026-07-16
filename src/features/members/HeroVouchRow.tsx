import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useVouch } from "../../app/providers/VouchProvider";
import {
  memberProfiles,
  currentUserSlug,
  type MemberProfile,
} from "./data/memberProfiles";
import { useVouchers, type VoucherFace } from "./api/useVouchers";
import styles from "./ProfilePage.module.css";

/**
 * The hero's vouch row: overlapping voucher avatars and the "Vouched for by …"
 * caption (or an empty-state prompt). Extracted from `ProfileHero` so that
 * component stays under the line cap. `realSelf`/`isSelf` are resolved by the
 * caller against the authenticated user.
 */
export function HeroVouchRow({
  profile,
  realSelf,
  isSelf,
}: {
  profile: MemberProfile;
  realSelf: boolean;
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  const { hasVouched } = useVouch();
  const vouched = hasVouched(profile.slug);

  // Real voucher faces: demo derives them from the mock registry, live fetches
  // GET /members/:slug/vouchers. Falls back to the profile's own vouch data
  // while loading / when nothing resolves, so the row never flashes empty.
  const { data: fetchedFaces } = useVouchers(profile.slug);
  const baseFaces: VoucherFace[] =
    fetchedFaces && fetchedFaces.length > 0
      ? fetchedFaces
      : profile.vouchers.flatMap((slug) => {
          const v = memberProfiles[slug];
          if (!v) return [];
          return [
            {
              slug,
              name: `${v.first} ${v.last}`,
              initials: v.initials,
              tint: v.tint,
              avatarUrl: v.photo,
            },
          ];
        });

  // Reflect the viewer's own optimistic vouch when it isn't already in the list.
  const youAdded =
    vouched && !realSelf && !baseFaces.some((f) => f.slug === currentUserSlug);
  const you = memberProfiles[currentUserSlug];
  const faces: VoucherFace[] =
    youAdded && you
      ? [
          ...baseFaces,
          {
            slug: currentUserSlug,
            name: `${you.first} ${you.last}`,
            initials: you.initials,
            tint: you.tint,
            avatarUrl: you.photo,
          },
        ]
      : baseFaces;
  const namesText = !youAdded
    ? profile.voucherNames
    : baseFaces.length > 0
      ? t("members:hero.vouch.namesPlusYou", { names: profile.voucherNames })
      : t("members:hero.vouch.youOnly");

  return (
    <div className={styles.vouchRow}>
      {faces.length > 0 ? (
        <>
          <div className={styles.vouchFaces}>
            {faces.map((face, index) => (
              <Link
                key={face.slug}
                to={`/members/${face.slug}`}
                className={styles.vouchFace}
                style={{
                  marginLeft: index === 0 ? 0 : -12,
                  zIndex: faces.length - index,
                }}
              >
                <span className={styles.vouchTip}>{face.name}</span>
                <Avatar
                  initials={face.initials}
                  tint={face.tint}
                  size={52}
                  src={face.avatarUrl}
                  alt={face.name}
                />
              </Link>
            ))}
          </div>
          <div className={styles.vouchText}>
            <Translation
              i18nKey="members:hero.vouch.by"
              components={{ b: <b /> }}
              values={{ names: namesText }}
            />
            <br />
            {t("members:hero.vouch.onlyNumberMatters")}
          </div>
        </>
      ) : (
        <div className={styles.vouchText}>
          {isSelf
            ? t("members:hero.vouch.emptySelf")
            : t("members:hero.vouch.emptyOther", { first: profile.first })}
        </div>
      )}
    </div>
  );
}
