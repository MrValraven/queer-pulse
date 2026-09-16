import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Conversation } from "./data";
import styles from "./GroupInfoModal.module.css";

/**
 * ENG-238: once the signed-in member has left/been removed/the group has
 * dissolved, `active.members` is `[]` (no roster, no watermarks) and every
 * management action is hidden, this short explanation stands in for the
 * roster instead of rendering an empty list. Copy mirrors
 * `ComposerSeveredNotice`'s `leftReason` switch, so the group-info surface
 * and the composer bar never disagree about why.
 */
export function GroupInfoLeftNotice({ active }: { active: Conversation }) {
  const { t } = useTranslation();
  const noticeKey =
    active.leftReason === "removed"
      ? "messages:group.leftNotice.removed"
      : active.leftReason === "dissolved"
        ? "messages:group.leftNotice.dissolved"
        : "messages:group.leftNotice.left";
  return <p className={styles.leftNotice}>{t(noticeKey)}</p>;
}
