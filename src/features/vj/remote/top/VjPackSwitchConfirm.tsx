import type { JSX } from "react";
import { ConfirmDialog } from "../../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useQuizshowDarkDialog } from "../../../quizshow/builder/useQuizshowDarkDialog";
import type { VjPackReadiness } from "../rules/vjPackReadiness";

export interface VjPackSwitchConfirmProps {
  packName: string;
  currentPackName: string | null;
  readiness: VjPackReadiness;
  onAccept: () => void;
  onDismiss: () => void;
}

/** The body names how many of the pack's clips the screens hold ready. */
function switchBodyOf(readiness: VjPackReadiness): {
  key: string;
  values: Record<string, number>;
} {
  if (readiness.kind === "partial" || readiness.kind === "ready") {
    return {
      key: "vj:top.switchPartial",
      values: { ready: readiness.readyCount, total: readiness.totalCount },
    };
  }
  return { key: "vj:top.switchNotLoaded", values: {} };
}

/**
 * Asks before switching to a pack the screens have not finished loading.
 * Mount it inside an `AnimatePresence` while the switch asks to confirm, so
 * the shared Modal animates in and out; the dialog portals to the body, and
 * the stamp keeps it in the remote's dark stage look.
 */
export function VjPackSwitchConfirm({
  packName,
  currentPackName,
  readiness,
  onAccept,
  onDismiss,
}: VjPackSwitchConfirmProps): JSX.Element {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const body = switchBodyOf(readiness);

  return (
    <ConfirmDialog
      open
      tone="neutral"
      title={t("vj:top.switchTitle", { pack: packName })}
      description={t(body.key, body.values)}
      confirmLabel={t("vj:top.switchConfirm")}
      cancelLabel={
        currentPackName === null
          ? undefined
          : t("vj:top.switchCancel", { pack: currentPackName })
      }
      onConfirm={onAccept}
      onClose={onDismiss}
    >
      <span
        ref={darkDialogRef}
        hidden
        data-vj-pack-switch-confirm={readiness.kind}
      />
    </ConfirmDialog>
  );
}
