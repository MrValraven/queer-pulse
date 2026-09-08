import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiEye,
  FiLock,
  FiMessageCircle,
  FiSlash,
} from "react-icons/fi";
import { MdAccessible } from "react-icons/md";

/**
 * The icon a principle key draws, and the avatar palette a council tint draws.
 *
 * ONE table, because three surfaces render the same closed sets and a copy of
 * this in each of them is a copy that can drift: the public Governance page,
 * the admin Policy editor's live preview of that page, and the admin hook that
 * has to recover a key back out of a mock's icon component. A principle whose
 * icon rendered differently in the preview than on the page would make the
 * preview a liar about the one thing it exists to show.
 *
 * The key sets themselves are `PRINCIPLE_ICONS` and `COUNCIL_TINTS` in
 * `admin/adminGovernanceOverviewRows.utils.ts`, which the backend also pins
 * with `@IsIn`.
 */
export const PRINCIPLE_ICON_BY_KEY: Record<string, IconType> = {
  lock: FiLock,
  eye: FiEye,
  slash: FiSlash,
  message: FiMessageCircle,
  book: FiBookOpen,
  accessible: MdAccessible,
};

/** The icon drawn for a principle whose key predates the table above. */
export const FALLBACK_PRINCIPLE_ICON: IconType = FiLock;

export function principleIcon(iconKey: string): IconType {
  return PRINCIPLE_ICON_BY_KEY[iconKey] ?? FALLBACK_PRINCIPLE_ICON;
}

export const COUNCIL_TINT_BY_KEY = {
  jade: { background: "rgba(74,140,111,.15)", color: "var(--jade)" },
  violet: { background: "rgba(122,82,184,.12)", color: "var(--violet)" },
  plum: { background: "rgba(45,27,61,.1)", color: "var(--plum)" },
} satisfies Record<string, { background: string; color: string }>;
