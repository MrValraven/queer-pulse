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
import { MutualVouchersChip } from "./MutualVouchersChip";
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
 * The overlapping stack of voucher avatars. Split out of {@link HeroVouchRow}
 * so that component stays well under the line cap once it branches on all the
 * ways a roster can be empty.
 *
 * Every face is an interactive control that carries its own accessible name:
 * a named voucher is a `<Link>` to their profile, labelled by the tooltip text
 * and the `Avatar`'s `alt`; an anonymous voucher has nowhere to go, so it stays
 * a non-interactive `<span>` out of the tab order, named by `aria-label` for a
 * screen reader that walks the row. The stack is never decorative: the faces
 * ARE the content of this row.
 */
function VoucherFaceStack({ faces }: { faces: VoucherFace[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.vouchFaces}>
      {faces.map((face, index) => {
        const stackStyle = {
          marginLeft: index === 0 ? 0 : -12,
          zIndex: faces.length - index,
        };
        // An anonymous voucher has no slug — render an un-linked face with
        // a generic name so the identity is never exposed or navigable.
        if (face.anonymous) {
          const anonymousName = t("members:hero.vouch.anonymous");
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
              aria-label={anonymousName}
            >
              <span className={styles.vouchTip}>
                <span className={styles.nameRow}>{anonymousName}</span>
              </span>
              <Avatar
                initials={face.initials}
                tint={face.tint}
                size={52}
                alt={anonymousName}
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
  );
}

/**
 * The hero's vouch row: overlapping voucher avatars and the "Vouched for by …"
 * caption. Extracted from `ProfileHero` so that component stays under the line
 * cap. `realSelf`/`isSelf` are resolved by the caller against the authenticated
 * user.
 *
 * There are three things this row can be looking at, and only one of them means
 * nobody has vouched:
 *
 * 1. **A resolvable roster** — faces, names, texture chips. Also what the
 *    profile's OWNER sees on a roster they have hidden, because the backend
 *    exempts the owner from their own `vouchersVisible` gate. They get an extra
 *    line saying so, since the row they are reading is not the row a visitor
 *    reads.
 * 2. **A count with no roster** — the member turned `vouchersVisible` off and
 *    the backend returned the true `count` with an empty `vouchers` array. The
 *    row states the number and says the names are hidden. It also covers the
 *    brief window before the fetch resolves, where a true count is already on
 *    the profile and no faces are yet.
 * 3. **Genuinely nothing** — count zero. The only case that may ask for a vouch.
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
  const { data: mutuals } = useProfileMutuals(
    isSelf ? undefined : profile.slug,
  );
  const mutualsCount = mutuals?.count ?? 0;

  // "N members you know vouched for them" (SOC-15), already gated by the
  // backend: null when the viewer IS this member, and when this member hid
  // their voucher roster. `?? 0` collapses that into "render nothing".
  const mutualVoucherCount = profile.mutualVoucherCount ?? 0;

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

  // The member's true vouch tally. `Member.vouchers` looks like a roster and is
  // not one in live mode: `cardToMember` fills it with exactly `dto.vouchCount`
  // placeholder entries, so its LENGTH is the profile DTO's `vouchCount` and
  // nothing else. That is the number the backend contract says to print, and it
  // is the same expression `ProfileTrustSignals` reads a few lines below on this
  // very profile, so the hero and the trust row cannot disagree about one
  // person. Never count `useVouchers`' faces instead: that array is a bounded
  // page (20 by default) and is empty outright on a hidden roster.
  const vouchCount = profile.vouchers?.length ?? 0;

  // The member turned their voucher roster off. The backend still sends the
  // true `count` and withholds only the names, and it exempts the owner: the
  // owner's own fetch carries the full roster (backend `listVouchers`, and the
  // profile DTO ships `vouchersVisible` unchanged to every viewer, precisely so
  // a visitor can tell an empty roster apart from an absent one). So this is
  // "hidden from the person currently looking", which is never the owner.
  const isRosterHidden = profile.vouchersVisible === false;
  const isRosterHiddenFromViewer = isRosterHidden && !isSelf;

  if (faces.length === 0) {
    // No faces to draw. Whether that means "nobody has vouched" is decided by
    // the count, never by the emptiness of the roster: a hidden roster arrives
    // empty with a real number attached, and asking for a vouch there would be
    // soliciting on a falsehood the trust row directly below contradicts.
    return (
      <div className={styles.vouchRow}>
        <div className={styles.vouchText}>
          {vouchCount > 0 ? (
            <>
              <Translation
                i18nKey="members:hero.vouch.countOnly"
                components={{ b: <b /> }}
                values={{ count: vouchCount }}
              />
              {isRosterHiddenFromViewer && (
                <>
                  <br />
                  {t("members:hero.vouch.namesHidden")}
                </>
              )}
            </>
          ) : isSelf ? (
            t("members:hero.vouch.emptySelf")
          ) : (
            t("members:hero.vouch.emptyOther", { first: profile.first })
          )}
        </div>
      </div>
    );
  }

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
      <VoucherFaceStack faces={faces} />
      <div className={styles.vouchText}>
        <Translation
          i18nKey="members:hero.vouch.by"
          components={{ b: <b /> }}
          values={{ names: namesText }}
        />
        <br />
        {t(
          isSelf
            ? "members:hero.vouch.onlyNumberMattersSelf"
            : "members:hero.vouch.onlyNumberMatters",
        )}
        {/* The owner is looking at a roster their visitors cannot see. Say so
            here rather than leaving them to guess from the privacy sheet. */}
        {isSelf && isRosterHidden && (
          <>
            <br />
            {t("members:hero.vouch.namesHiddenSelf")}
          </>
        )}
        {(textureRelationships.length > 0 ||
          mutualsCount > 0 ||
          mutualVoucherCount > 0) && (
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
            <MutualVouchersChip count={mutualVoucherCount} />
          </div>
        )}
      </div>
    </div>
  );
}
