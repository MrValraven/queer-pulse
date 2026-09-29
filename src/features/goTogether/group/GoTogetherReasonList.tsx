import type { IconType } from "react-icons";
import {
  FiHeadphones,
  FiMapPin,
  FiMessageCircle,
  FiStar,
  FiSun,
} from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GroupReason } from "../api/goTogether.types";
import { reasonCopy } from "./reasonCopy";
import styles from "./GoTogetherGroup.module.css";

const REASON_ICONS: Record<GroupReason["kind"], IconType> = {
  interests: FiStar,
  music: FiHeadphones,
  energy: FiSun,
  area: FiMapPin,
  hostQuestion: FiMessageCircle,
};

interface GoTogetherReasonListProps {
  reasons: GroupReason[];
  /** Shows only the first N reasons this client can phrase. */
  limit?: number;
  className?: string;
}

/** The two or three things a group has in common, one line and one icon
 *  each. Reasons of a kind this client cannot phrase are skipped. */
export function GoTogetherReasonList({
  reasons,
  limit,
  className,
}: GoTogetherReasonListProps) {
  const { t, language } = useTranslation();
  const phrasedReasons = reasons
    .map((reason, position) => ({
      reason,
      position,
      copy: reasonCopy(reason, t, language),
    }))
    .filter((entry) => entry.copy !== null)
    .slice(0, limit);
  if (phrasedReasons.length === 0) return null;

  return (
    <ul className={[styles.reasonList, className].filter(Boolean).join(" ")}>
      {phrasedReasons.map(({ reason, position, copy }) => {
        const ReasonIcon = REASON_ICONS[reason.kind];
        return (
          <li key={`${reason.kind}-${position}`} className={styles.reasonItem}>
            <span className={styles.reasonIcon} aria-hidden="true">
              <ReasonIcon size={15} />
            </span>
            <span>{copy ? t(copy.key, copy.values) : null}</span>
          </li>
        );
      })}
    </ul>
  );
}
