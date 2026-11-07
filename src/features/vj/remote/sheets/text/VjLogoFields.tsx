import { useState, type ReactNode } from "react";
import { Button, Collapse } from "../../../../../shared/components/ui";
import {
  VJ_LOGO_CORNERS,
  type VjLogo,
  type VjLogoCorner,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjStageCommands } from "../../../live/vjStageCommands";
import { VjChoiceChips } from "./VjOverlayFields";
import styles from "./VjTextSheetV2.module.css";

export type VjLogoPatch = Parameters<VjStageCommands["setLogo"]>[0];

/**
 * The Logo section: four corner chips, Show logo, Hide logo. While the logo
 * shows, a corner chip moves it at once.
 */
export function VjLogoFields({
  logo,
  isHeld,
  onSend,
  alert,
}: {
  logo: VjLogo;
  isHeld: boolean;
  onSend: (patch: VjLogoPatch) => void;
  /** The section's reason line, under the actions. */
  alert: ReactNode;
}) {
  const { t } = useTranslation();
  const [corner, setCorner] = useState<VjLogoCorner>(logo.corner);

  return (
    <div className={styles.fields} data-vj-text-fields="logo">
      <VjChoiceChips
        title={t("vj:logo.corner")}
        options={VJ_LOGO_CORNERS}
        value={corner}
        labelOf={(option) => t(`vj:logo.corner.${option}`)}
        onChoose={(option) => {
          setCorner(option);
          if (logo.isVisible && option !== logo.corner)
            onSend({ corner: option });
        }}
        isHeld={isHeld}
        layout="grid"
      />
      <div className={styles.actions}>
        <Collapse isOpen={!logo.isVisible}>
          <Button
            variant="stage"
            className={styles.actionButton}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld) onSend({ isVisible: true, corner });
            }}
          >
            {t("vj:logo.show")}
          </Button>
        </Collapse>
        <Collapse isOpen={logo.isVisible}>
          <Button
            variant="stage-ghost"
            className={styles.actionButton}
            aria-disabled={isHeld}
            onClick={() => {
              if (!isHeld) onSend({ isVisible: false });
            }}
          >
            {t("vj:logo.hide")}
          </Button>
        </Collapse>
      </div>
      {alert}
    </div>
  );
}
