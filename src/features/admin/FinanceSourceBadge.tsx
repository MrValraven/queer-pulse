import type { IconType } from "react-icons";
import { FiAlertCircle, FiCheck, FiCornerDownRight } from "react-icons/fi";
import { Badge, type BadgeTone } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { FinanceMetricSource } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernancePage.module.css";

/** Visual + semantic mapping for each provenance state. Colour is never the
 *  sole signal — every state pairs a distinct icon and its own word. */
const SOURCE_META: Record<
  FinanceMetricSource,
  { tone: BadgeTone; icon: IconType; labelKey: string; hintKey: string }
> = {
  seeded: {
    tone: "amber",
    icon: FiAlertCircle,
    labelKey: "governance.finances.provenance.seeded",
    hintKey: "governance.finances.provenance.seeded.hint",
  },
  manual: {
    tone: "jade",
    icon: FiCheck,
    labelKey: "governance.finances.provenance.manual",
    hintKey: "governance.finances.provenance.manual.hintPlain",
  },
  computed: {
    tone: "ghost",
    icon: FiCornerDownRight,
    labelKey: "governance.finances.provenance.computed",
    hintKey: "governance.finances.provenance.computed.hint",
  },
};

/**
 * A small provenance pill flagging where a finance figure came from —
 * `Unverified` (seeded placeholder), `Edited` (admin-entered), or `Computed`
 * (derived). Renders icon + word so it reads without relying on colour, and
 * carries the fuller explanation as a `title` tooltip.
 */
export function FinanceSourceBadge({
  source,
}: {
  source: FinanceMetricSource;
}) {
  const { t } = useTranslation();
  const meta = SOURCE_META[source];
  const Icon = meta.icon;
  return (
    <span className={styles.sourceBadge} title={t(`admin:${meta.hintKey}`)}>
      <Badge tone={meta.tone}>
        <Icon aria-hidden className={styles.sourceBadgeIco} />
        {t(`admin:${meta.labelKey}`)}
      </Badge>
    </span>
  );
}
