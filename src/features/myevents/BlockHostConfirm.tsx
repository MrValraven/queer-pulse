import { ConfirmDialog } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";

/**
 * Confirm step before blocking a host — a destructive action, so it uses the
 * shared `ConfirmDialog` in the `destructive` tone (danger confirm button) and
 * is never a one-tap block.
 */
export function BlockHostConfirm() {
  const { t } = useTranslation();
  const { block, confirmBlock, closeBlock } = useMyEvents();

  return (
    <ConfirmDialog
      open={block.open}
      onClose={closeBlock}
      onConfirm={confirmBlock}
      tone="destructive"
      title={
        block.host ? (
          <Translation
            i18nKey="myevents:blockModal.titleNamed"
            components={{ em: <em /> }}
            values={{ host: block.host }}
          />
        ) : (
          <Translation
            i18nKey="myevents:blockModal.titleFallback"
            components={{ em: <em /> }}
          />
        )
      }
      description={
        block.host
          ? t("myevents:blockModal.bodyNamed", { host: block.host })
          : t("myevents:blockModal.bodyFallback")
      }
      confirmLabel={t("myevents:blockModal.confirmCta")}
      cancelLabel={t("myevents:blockModal.cancelCta")}
    />
  );
}
