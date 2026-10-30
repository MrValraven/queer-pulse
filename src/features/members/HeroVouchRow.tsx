import { useId, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useProfileMutuals } from "./api/useProfileMutuals";
import { type MemberProfile } from "./data/memberProfiles";
import type { VoucherFace } from "./api/useVouchers";
import { RELATIONSHIPS } from "./vouchMember.data";
import { useHeroVoucherFaces } from "./useHeroVoucherFaces";
import { pickCaptionFaces } from "./voucherSelection";
import { FACE_SIZE, VoucherFaceStack } from "./VoucherFaceStack";
import { VoucherCaption } from "./VoucherCaption";
import { VoucherRoster } from "./VoucherRoster";
import styles from "./ProfilePage.module.css";

/**
 * The hero's vouch row: a capped stack of voucher avatars, the short "Vouched
 * for by …" caption and an expandable roster of everyone who vouched. Extracted
 * from `ProfileHero` so that component stays under the line cap. `realSelf` and
 * `isSelf` are resolved by the caller against the authenticated user. Mounted
 * twice: in `ProfileHeroMain` on desktop and in `MobileProfileHeader` on mobile,
 * which passes `className` and a smaller `faceSize` to fit the narrow column.
 * Both are optional and leave the desktop row as it was when omitted.
 *
 * There are three things this row can be looking at, and only one of them means
 * nobody has vouched:
 *
 * 1. **A resolvable roster**: faces, names, texture chips. Also what the
 *    profile's OWNER sees on a roster they have hidden, because the backend
 *    exempts the owner from their own `vouchersVisible` gate. They get an extra
 *    line saying so, since the row they are reading is not the row a visitor
 *    reads.
 * 2. **A count with no roster**: the member turned `vouchersVisible` off and
 *    the backend returned the true `count` with an empty `vouchers` array. The
 *    row states the number and says the names are hidden. It also covers the
 *    brief window before the fetch resolves, where a true count is already on
 *    the profile and no faces are yet.
 * 3. **Genuinely nothing**: count zero. The only case that may ask for a vouch.
 */
export function HeroVouchRow({
  profile,
  realSelf,
  isSelf,
  className,
  faceSize = FACE_SIZE,
  isMutualsChipShown = true,
}: {
  profile: MemberProfile;
  realSelf: boolean;
  isSelf: boolean;
  /** Extra class merged onto the row, for a caller's layout overrides. */
  className?: string;
  /** Diameter of one voucher face, in px. Defaults to the desktop size. */
  faceSize?: number;
  /** Whether the "N mutuals" chip renders. Mobile passes false because
   *  `ProfileMutualsCard` sits right below this row and already names them. */
  isMutualsChipShown?: boolean;
}) {
  const { t } = useTranslation();
  const rosterId = useId();
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const toggleRoster = () => setIsRosterOpen((isOpen) => !isOpen);
  const { faces, selfSlug, hasOptimisticFace } = useHeroVoucherFaces(
    profile,
    realSelf,
  );

  // Mutual connections between the viewer and this member: a visitor-only
  // social-proof signal, folded into this row's terse "N mutual" texture
  // chip (mirrors `ProfileMutualsCard`'s own framing up in the hero, which
  // names each mutual), so it never renders on
  // the viewer's own profile. A caller that hides the chip skips the fetch
  // too. `useProfileMutuals` shares its query key with `ProfileMutualsCard`
  // when both are mounted, so React Query dedupes the network request.
  const { data: mutuals } = useProfileMutuals(
    isSelf || !isMutualsChipShown ? undefined : profile.slug,
  );
  const mutualsCount = isMutualsChipShown ? (mutuals?.count ?? 0) : 0;

  // "N members you know vouched for them" (SOC-15), already gated by the
  // backend: null when the viewer IS this member, and when this member hid
  // their voucher roster. `?? 0` collapses that into "render nothing".
  const mutualVoucherCount = profile.mutualVoucherCount ?? 0;

  // Whether the viewer is one of this member's vouchers. Read off the merged
  // roster so it covers both the optimistic face and the viewer's own vouch
  // once the live API returns it. The caption must never key off the optimistic
  // face alone, or it prints the viewer's own name in third person.
  const isViewerFace = (face: VoucherFace) =>
    !face.anonymous && face.slug === selfSlug;
  const isViewerAVoucher =
    !realSelf && selfSlug != null && faces.some(isViewerFace);
  // Everyone on the roster apart from the viewer. The caption names these
  // people and then appends "you" when the viewer has vouched too.
  const otherFaces = isViewerAVoucher
    ? faces.filter((face) => !isViewerFace(face))
    : faces;
  const hasOtherVouchers = otherFaces.length > 0;

  // The member's true vouch tally. `Member.vouchers` looks like a roster and is
  // not one in live mode: `cardToMember` fills it with exactly `dto.vouchCount`
  // placeholder entries, so its LENGTH is the profile DTO's `vouchCount` and
  // nothing else. That is the number the backend contract says to print, and it
  // is the same expression `ProfileTrustSignals` reads a few lines below on this
  // very profile, so the hero and the trust row cannot disagree about one
  // person. `useVouchers`' faces are a bounded page (20 by default) and empty
  // outright on a hidden roster, so they only raise the tally when the profile
  // count has not caught up with the viewer's optimistic face.
  const vouchCount = profile.vouchers?.length ?? 0;
  const totalCount = Math.max(
    vouchCount + (hasOptimisticFace ? 1 : 0),
    faces.length,
  );

  // The member turned their voucher roster off. The backend still sends the
  // true `count` and withholds only the names, and it exempts the owner: the
  // owner's own fetch carries the full roster (backend `listVouchers`). The
  // `vouchersVisible` toggle itself is owner-only (ENG-444); a visitor's value
  // is inferred in `profileToMember` from `mutualVoucherCount === null`, which
  // the backend sends a non-owner exactly when the roster is hidden. So this
  // is "hidden from the person currently looking", which is never the owner.
  const isRosterHidden = profile.vouchersVisible === false;
  const isRosterHiddenFromViewer = isRosterHidden && !isSelf;
  const rowClassName = className
    ? `${styles.vouchRow} ${className}`
    : styles.vouchRow;

  if (faces.length === 0) {
    // No faces to draw. Whether that means "nobody has vouched" is decided by
    // the count, and the emptiness of the roster plays no part: a hidden roster
    // arrives empty with a real number attached, and asking for a vouch there
    // would be soliciting on a falsehood the trust row directly below
    // contradicts.
    return (
      <div className={rowClassName}>
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

  // The caption names a few vouchers other than the viewer and counts the
  // rest as "N others". Live and demo both derive the names from the faces.
  const otherTotal = totalCount - (isViewerAVoucher ? 1 : 0);
  const captionNames = pickCaptionFaces(otherFaces, otherTotal).map((face) =>
    face.anonymous ? t("members:hero.vouch.anonymous") : face.name,
  );
  const othersCount = Math.max(0, otherTotal - captionNames.length);
  // The viewer is the only voucher: the caption speaks to them directly, and
  // the "a familiar face vouched" line would only be describing the viewer.
  const isViewerTheOnlyVoucher = isViewerAVoucher && !hasOtherVouchers;

  // "Texture" chips: the distinct ways these vouchers know the member, one
  // chip per distinct value (a chip per voucher could explode into a long,
  // redundant row), capped at 3 and shown in canonical enum order.
  const textureRelationships = RELATIONSHIPS.filter((relationship) =>
    faces.some((face) => face.relationships.includes(relationship)),
  ).slice(0, 3);

  return (
    <>
      <div className={rowClassName}>
        <VoucherFaceStack
          faces={faces}
          faceSize={faceSize}
          totalCount={totalCount}
          viewerSlug={selfSlug}
          isRosterOpen={isRosterOpen}
          rosterId={rosterId}
          onToggleRoster={toggleRoster}
        />
        <VoucherCaption
          first={profile.first}
          isSelf={isSelf}
          isRosterHidden={isRosterHidden}
          names={captionNames}
          othersCount={othersCount}
          isViewerAVoucher={isViewerAVoucher}
          isViewerTheOnlyVoucher={isViewerTheOnlyVoucher}
          isRosterOpen={isRosterOpen}
          rosterId={rosterId}
          onToggleRoster={toggleRoster}
          textureRelationships={textureRelationships}
          mutualsCount={mutualsCount}
          mutualVoucherCount={mutualVoucherCount}
        />
      </div>
      <VoucherRoster
        faces={faces}
        totalCount={totalCount}
        isOpen={isRosterOpen}
        rosterId={rosterId}
        onClose={() => setIsRosterOpen(false)}
      />
    </>
  );
}
