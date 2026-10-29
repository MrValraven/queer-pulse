import { createElement } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useClipboard } from "../../../shared/hooks/useClipboard";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityGivingMethodDTO } from "../api/communityGiving.api";
import { givingMethodIcon, givingMethodTitle } from "./givingPlatforms";
import { formatGivingValue } from "./givingValue";
import styles from "./Giving.module.css";

type GivingCopyKind = "mbway" | "iban";

const COPY_KEYS = {
  mbway: {
    cta: "communities:detail.giving.copy.mbwayCta",
    aria: "communities:detail.giving.copy.mbwayAria",
    copiedToast: "communities:detail.giving.copy.mbwayCopiedToast",
  },
  iban: {
    cta: "communities:detail.giving.copy.ibanCta",
    aria: "communities:detail.giving.copy.ibanAria",
    copiedToast: "communities:detail.giving.copy.ibanCopiedToast",
  },
} as const satisfies Record<
  GivingCopyKind,
  { cta: string; aria: string; copiedToast: string }
>;

/** An MB WAY number or IBAN shown grouped, with a button that copies the
 *  stored compact value. When the clipboard refuses, an error toast says so
 *  and the value stays on screen, selectable in one tap. The value never
 *  goes into an accessible name or a tooltip, and nothing records a copy. */
export function GivingCopyRow({
  method,
}: {
  method: Pick<CommunityGivingMethodDTO, "kind" | "label" | "value">;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { copy, copied } = useClipboard();
  const copyKind: GivingCopyKind = method.kind === "iban" ? "iban" : "mbway";
  const keys = COPY_KEYS[copyKind];
  const title = givingMethodTitle(method);
  const copiedToast = t(keys.copiedToast);

  async function copyValue() {
    const didCopy = await copy(method.value);
    if (didCopy) showToast(copiedToast, "success");
    else showToast(t("communities:detail.giving.copy.errorToast"), "error");
  }

  return (
    <div className={`${styles.row} ${styles.copyRow}`}>
      {createElement(givingMethodIcon(method), {
        "aria-hidden": true,
        className: styles.icon,
      })}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value} translate="no">
          {formatGivingValue(method.kind, method.value)}
        </span>
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={styles.copyButton}
        data-copied={copied ? "true" : undefined}
        aria-label={t(keys.aria, { label: title })}
        onClick={() => void copyValue()}
      >
        {/* The name and the visible text stay the same in both states: the
         *  success toast (role=status) is the one announcement, and the
         *  visible "Copy IBAN" stays inside the name "Copy IBAN for {label}"
         *  (WCAG 2.5.3). Only the icon and the data-copied tint change. */}
        {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
        {t(keys.cta)}
      </Button>
    </div>
  );
}
