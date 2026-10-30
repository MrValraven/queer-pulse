import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { VoucherFace } from "./api/useVouchers";
import { maxStackFaces, pickStackFaces } from "./voucherSelection";
import { VoucherOverflowBubble } from "./VoucherOverflowBubble";
import styles from "./ProfilePage.module.css";

/** Default diameter of one voucher face, in px (the desktop hero). */
export const FACE_SIZE = 52;
/** How far each face slides under the one before it at `FACE_SIZE`, in px.
 *  A smaller `faceSize` scales it down in proportion. */
const FACE_OVERLAP = 12;

/**
 * The overlapping stack of voucher avatars. It draws at most
 * `maxStackFaces(faceSize)` faces and folds the rest into one "+N" bubble that
 * toggles the roster. The viewer's own face keeps its place in the stack.
 *
 * Every face is an interactive control that carries its own accessible name:
 * a named voucher is a `<Link>` to their profile, labelled by the tooltip text
 * and the `Avatar`'s `alt`; an anonymous voucher has nowhere to go, so it stays
 * a non-interactive `<span>` out of the tab order, named by `aria-label` for a
 * screen reader that walks the row. The stack is never decorative: the faces
 * ARE the content of this row.
 */
export function VoucherFaceStack({
  faces,
  faceSize,
  totalCount,
  viewerSlug,
  isRosterOpen,
  rosterId,
  onToggleRoster,
}: {
  faces: VoucherFace[];
  faceSize: number;
  /** The member's true vouch tally, which can exceed `faces.length`. */
  totalCount: number;
  viewerSlug: string | undefined;
  isRosterOpen: boolean;
  rosterId: string;
  onToggleRoster: () => void;
}) {
  const { t } = useTranslation();
  const faceOverlap = Math.round((faceSize * FACE_OVERLAP) / FACE_SIZE);
  // Distance between two face centres in the stack, in px.
  const faceStep = faceSize - faceOverlap;
  const visibleFaces = pickStackFaces(
    faces,
    maxStackFaces(faceSize),
    viewerSlug,
  );
  const hiddenCount = totalCount - visibleFaces.length;
  return (
    <div className={styles.vouchFaces}>
      {visibleFaces.map((face, index) => {
        const stackStyle = {
          marginLeft: index === 0 ? 0 : -faceOverlap,
          zIndex: visibleFaces.length - index,
          // How much room the name tooltip has to its left before it would
          // run past the start of the stack, where `.phero`'s
          // `overflow-x: clip` slices it off. The CSS centres the bubble on
          // this face but never shifts it further left than this value.
          "--vouch-tip-room": `${index * faceStep + faceSize / 2}px`,
        } as CSSProperties;
        // An anonymous voucher has no slug: render an un-linked face with
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
                size={faceSize}
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
              size={faceSize}
              src={face.avatarUrl}
              alt={face.name}
            />
          </Link>
        );
      })}
      {hiddenCount > 0 && (
        <VoucherOverflowBubble
          hiddenCount={hiddenCount}
          totalCount={totalCount}
          faceSize={faceSize}
          faceOverlap={faceOverlap}
          isOpen={isRosterOpen}
          rosterId={rosterId}
          onToggle={onToggleRoster}
        />
      )}
    </div>
  );
}
