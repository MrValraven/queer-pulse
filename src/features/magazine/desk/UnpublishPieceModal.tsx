import { useId, useState } from "react";
import { ConfirmDialog, RadioCardGroup } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { UnpublishLandingStage } from "../api/piecePublish.api";
import { UNPUBLISH_DESTINATIONS } from "./unpublishPieceModal.data";
import styles from "./DeskModals.module.css";

export interface UnpublishPieceModalProps {
  title: string;
  /** True while the request is out: both buttons are disabled. */
  isPending: boolean;
  onClose: () => void;
  /** Sends the unpublish to the destination picked in the radio. */
  onConfirm: (stage: UnpublishLandingStage) => void;
}

/**
 * The confirm in front of the desk's unpublish (the row's "Unpublish…" item
 * and the Published board card's "Unpublish" button). Built on the shared
 * `ConfirmDialog`, like the neighbouring Delete dialog: the description says
 * what readers lose, a two-option radio picks where the piece goes back to
 * (Draft by default), and the confirm button names that choice. Focus opens
 * on Cancel, the safer of the two.
 */
export function UnpublishPieceModal({
  title,
  isPending,
  onClose,
  onConfirm,
}: UnpublishPieceModalProps) {
  const { t } = useTranslation();
  const legendId = useId();
  const [stage, setStage] = useState<UnpublishLandingStage>("drafting");
  const picked =
    UNPUBLISH_DESTINATIONS.find((option) => option.stage === stage) ??
    UNPUBLISH_DESTINATIONS[0];

  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={isPending}
      initialFocus="cancel"
      onClose={() => {
        if (!isPending) onClose();
      }}
      onConfirm={() => onConfirm(stage)}
      title={t("magazine:desk.unpublishConfirm.title", { title })}
      description={t("magazine:desk.unpublishConfirm.body")}
      cancelLabel={t("magazine:desk.modals.cancel")}
      confirmLabel={picked ? t(picked.confirmKey) : undefined}
    >
      <p id={legendId} className={styles.destinationLegend}>
        {t("magazine:desk.unpublishConfirm.destinationLegend")}
      </p>
      <RadioCardGroup
        value={stage}
        onChange={setStage}
        ariaLabel={t("magazine:desk.unpublishConfirm.destinationLegend")}
        ariaLabelledBy={legendId}
        className={styles.destinations}
        optionClassName={styles.destination}
        checkedClassName={styles.destinationOn}
        options={UNPUBLISH_DESTINATIONS.map((option) => ({
          id: option.stage,
          isDisabled: isPending,
          render: (
            <>
              <span className={styles.destinationDot} aria-hidden />
              <span>{t(option.optionKey)}</span>
            </>
          ),
        }))}
      />
    </ConfirmDialog>
  );
}
