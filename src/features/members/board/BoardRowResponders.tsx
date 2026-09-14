import { AvatarStack, type AvatarTint } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { BoardItem } from "../data/members";
import styles from "./BoardSection.module.css";

type Responder = NonNullable<BoardItem["responders"]>[number];

/** Every tint `Avatar` actually knows how to render. */
const AVATAR_TINTS = new Set<AvatarTint>([
  "default",
  "coral",
  "jade",
  "plum",
  "auth",
]);

/**
 * `Responder.tint` is a plain string off the wire, not typed against the
 * design system's tint vocabulary, so a value the backend never intended
 * (or a future tint this build doesn't know yet) must degrade to the
 * neutral tint rather than reach `Avatar`'s CSS class lookup unchecked. A
 * blind `as AvatarTint` cast would compile but could hand `Avatar` a string
 * with no matching class at run time; validating against the known set
 * keeps the render safe either way.
 */
function toAvatarTint(tint: string): AvatarTint {
  return AVATAR_TINTS.has(tint as AvatarTint)
    ? (tint as AvatarTint)
    : "default";
}

/**
 * How many responders to name in the line, distinct from how many avatars
 * the stack shows (up to 3, decided by the caller that caps `responders`).
 * The design names only the first two ("Beatriz, Tomás +1 offered to
 * help") even though a third avatar is visible, so the overflow count
 * folds in that third person too. This is not a bug: the avatar cap and
 * the names cap are deliberately different numbers.
 */
const NAMES_CAP = 2;

/**
 * Who offered to help, as an avatar stack plus a names line.
 *
 * `responseCount` is authoritative and `responders` is a capped display
 * sample, so the overflow is the difference between `responseCount` and
 * the names cap, clamped at 0 so a stale or low `responseCount` can never
 * go negative. Naming only the first two and counting the rest keeps the
 * line short however many people respond.
 */
export function BoardRowResponders({
  responders,
  responseCount,
}: {
  responders: Responder[];
  responseCount: number;
}) {
  const { t } = useTranslation();
  if (!responders.length) return null;

  const names = responders
    .slice(0, NAMES_CAP)
    .map((responder) => responder.first)
    .join(", ");
  const overflow = Math.max(0, responseCount - NAMES_CAP);

  return (
    <div className={styles.responders}>
      <AvatarStack
        size={26}
        avatars={responders.map((responder) => ({
          initials: responder.initials,
          tint: toAvatarTint(responder.tint),
          src: responder.avatarUrl ?? undefined,
        }))}
      />
      <span className={styles.respondersLine}>
        {overflow > 0
          ? t("members:content.board.offeredOverflow", {
              names,
              count: overflow,
            })
          : t("members:content.board.offeredToHelp", {
              names,
              count: responseCount,
            })}
      </span>
    </div>
  );
}
