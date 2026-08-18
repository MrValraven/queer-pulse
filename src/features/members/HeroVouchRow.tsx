import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useVouch } from "../../app/providers/useVouch";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import {
  memberProfiles,
  currentUserSlug,
  type MemberProfile,
} from "./data/memberProfiles";
import { useVouchers, type VoucherFace } from "./api/useVouchers";
import { useProfileMutuals } from "./api/useProfileMutuals";
import { initialsOf, tintForSlug } from "./api/members.adapters";
import { RELATIONSHIPS, type VouchRelationship } from "./vouchMember.data";
import type { AuthUser } from "../auth/api/auth.api";
import styles from "./ProfilePage.module.css";

/**
 * Labels for the read-only "texture" chips on this row — distinct from
 * `RELATIONSHIP_LABEL_KEY` in `vouchMember.data.ts`, which is first-person
 * form copy for the vouch-SUBMISSION modal ("We've collaborated"). Rendered
 * verbatim on someone else's profile, first-person has no clear antecedent;
 * these are short third-person noun phrases instead, matching the
 * `.hereForChip` convention ("Community events", "Mentoring juniors").
 */
const RELATIONSHIP_CHIP_LABEL_KEY: Record<VouchRelationship, string> = {
  collaborated: "members:vouch.relationshipChip.collaborated",
  friends: "members:vouch.relationshipChip.friends",
  group: "members:vouch.relationshipChip.group",
  met_through: "members:vouch.relationshipChip.met_through",
  neighbours: "members:vouch.relationshipChip.neighbours",
};

/**
 * The viewer's own "+ you" voucher face. Demo uses the mock persona; live builds
 * it from the real authenticated user so production never renders a demo name.
 * Returns null when the identity can't be resolved (logged-out live view).
 */
function resolveSelfFace(
  demoMode: boolean,
  user: AuthUser | null,
): VoucherFace | null {
  if (demoMode) {
    const you = memberProfiles[currentUserSlug];
    if (!you) return null;
    return {
      slug: currentUserSlug,
      name: `${you.first} ${you.last}`,
      initials: you.initials,
      tint: you.tint,
      avatarUrl: you.photo,
      // The viewer's own optimistic face carries no recorded relationship.
      relationships: [],
    };
  }
  if (!user) return null;
  const { slug, firstName, lastName, avatarUrl } = user.profile;
  return {
    slug,
    name: `${firstName} ${lastName}`,
    initials: initialsOf(firstName, lastName),
    tint: tintForSlug(slug),
    avatarUrl: avatarUrl ?? undefined,
    relationships: [],
  };
}

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
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { hasVouched } = useVouch();
  const vouched = hasVouched(profile.slug);

  // Mutual connections between the viewer and this member — a visitor-only
  // social-proof signal, folded into this row's terse "N mutual" texture
  // chip (mirrors `ProfileMutualsCard`'s own framing up in the hero, which
  // names the mutuals instead of just counting them), so it never renders on
  // the viewer's own profile. `useProfileMutuals` shares its query key with
  // `ProfileMutualsCard` when both are mounted, so React Query dedupes the
  // network request rather than firing it twice.
  const { data: mutuals } = useProfileMutuals(isSelf ? undefined : profile.slug);
  const mutualsCount = mutuals?.count ?? 0;

  // Real voucher faces: demo derives them from the mock registry, live fetches
  // GET /members/:slug/vouchers. In demo the fetch already resolves against the
  // mock registry; the `profile.vouchers` fallback only covers the while-loading
  // window and is DEMO-ONLY — live must never mix mock personas into API data.
  const { data: fetchedFaces } = useVouchers(profile.slug);
  const baseFaces: VoucherFace[] =
    fetchedFaces && fetchedFaces.length > 0
      ? fetchedFaces
      : demoMode
        ? profile.vouchers.flatMap((slug) => {
            const v = memberProfiles[slug];
            if (!v) return [];
            return [
              {
                slug,
                name: `${v.first} ${v.last}`,
                initials: v.initials,
                tint: v.tint,
                avatarUrl: v.photo,
                // No relationship data in this while-loading fallback — the
                // real fetch (above) resolves it via `useVouchers`.
                relationships: [],
              },
            ];
          })
        : [];

  // The viewer's own optimistic vouch face — the mock persona in demo, the real
  // authenticated user in live. Deduped by the viewer's ACTUAL slug so a vouch
  // already returned by the API (e.g. the inviter's auto-vouch) isn't doubled.
  // The old code always used the mock `currentUserSlug` ("tiago"), which never
  // matched a real slug — so in production it injected a demo "Tiago Costa" on
  // top of the real one.
  const selfSlug = demoMode ? currentUserSlug : user?.profile.slug;
  const youAdded =
    vouched &&
    !realSelf &&
    selfSlug != null &&
    !baseFaces.some((f) => f.slug === selfSlug);
  const youFace = youAdded ? resolveSelfFace(demoMode, user) : null;
  const faces: VoucherFace[] = youFace ? [...baseFaces, youFace] : baseFaces;

  // Base voucher names for the caption. `profile.voucherNames` is only populated
  // in demo; live derives the names from the fetched faces (the adapter leaves it
  // empty), which also fixes the stray leading comma the old live path showed.
  const baseNames = demoMode
    ? profile.voucherNames
    : baseFaces
        .map((f) => (f.anonymous ? t("members:hero.vouch.anonymous") : f.name))
        .join(", ");
  const namesText = !youFace
    ? baseNames
    : baseFaces.length > 0
      ? t("members:hero.vouch.namesPlusYou", { names: baseNames })
      : t("members:hero.vouch.youOnly");

  // "Texture" chips: the distinct ways these vouchers know the member, one
  // chip per distinct value (never per voucher, which could explode into a
  // long, redundant row), capped at 3 and shown in canonical enum order.
  const textureRelationships = RELATIONSHIPS.filter((relationship) =>
    faces.some((face) => face.relationships.includes(relationship)),
  ).slice(0, 3);

  return (
    <div className={styles.vouchRow}>
      {faces.length > 0 ? (
        <>
          <div className={styles.vouchFaces}>
            {faces.map((face, index) => {
              const stackStyle = {
                marginLeft: index === 0 ? 0 : -12,
                zIndex: faces.length - index,
              };
              // An anonymous voucher has no slug — render an un-linked face with
              // a generic name so the identity is never exposed or navigable.
              if (face.anonymous) {
                const anonName = t("members:hero.vouch.anonymous");
                return (
                  // Named faces are <Link>s (focusable); an anonymous face has no
                  // destination and performs no action, so it stays a plain,
                  // non-interactive span and is kept OUT of the tab order
                  // (jsx-a11y/no-noninteractive-tabindex). Its name remains
                  // accessible via this aria-label and the Avatar's own alt text.
                  <span
                    key={`anon-${index}`}
                    className={styles.vouchFace}
                    style={stackStyle}
                    aria-label={anonName}
                  >
                    <span className={styles.vouchTip}>
                      <span className={styles.nameRow}>{anonName}</span>
                    </span>
                    <Avatar
                      initials={face.initials}
                      tint={face.tint}
                      size={52}
                      alt={anonName}
                    />
                  </span>
                );
              }
              return (
                <Link
                  key={face.slug}
                  to={`/members/${face.slug}`}
                  className={styles.vouchFace}
                  style={stackStyle}
                >
                  <span className={styles.vouchTip}>
                    <span className={styles.nameRow}>
                      {face.name}
                      <MemberStaffBadge slug={face.slug} />
                    </span>
                  </span>
                  <Avatar
                    initials={face.initials}
                    tint={face.tint}
                    size={52}
                    src={face.avatarUrl}
                    alt={face.name}
                  />
                </Link>
              );
            })}
          </div>
          <div className={styles.vouchText}>
            <Translation
              i18nKey="members:hero.vouch.by"
              components={{ b: <b /> }}
              values={{ names: namesText }}
            />
            <br />
            {t("members:hero.vouch.onlyNumberMatters")}
            {(textureRelationships.length > 0 || mutualsCount > 0) && (
              <div className={styles.hereFor}>
                {textureRelationships.map((relationship) => (
                  <span key={relationship} className={styles.hereForChip}>
                    {t(RELATIONSHIP_CHIP_LABEL_KEY[relationship])}
                  </span>
                ))}
                {mutualsCount > 0 && (
                  <span className={styles.hereForChip}>
                    {t("members:card.mutualsCount", { count: mutualsCount })}
                  </span>
                )}
              </div>
            )}
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
