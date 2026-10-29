import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioTipModal } from "./StudioTipModal";
import styles from "./StudioPlayer.module.css";

const TIP_AMOUNT = 2;

/** Demo only (useStudioShowcase): the buy line and the tip button. */
export function StudioPlayerShowcase({ artistName }: { artistName: string }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const [isTipOpen, setIsTipOpen] = useState(false);
  return (
    <div className={styles.showcase}>
      <span className={styles.payLine}>
        <Translation
          i18nKey="studio:player.buyLine"
          components={{ b: <b /> }}
          values={{ artist: artistName }}
        />
      </span>
      <Button
        variant="soft"
        size="sm"
        className={styles.tip}
        onClick={() => setIsTipOpen(true)}
      >
        {t("studio:player.tipCta", {
          amount: formatters.currency(TIP_AMOUNT),
        })}
      </Button>
      {isTipOpen && (
        <StudioTipModal
          recipient={artistName}
          onClose={() => setIsTipOpen(false)}
        />
      )}
    </div>
  );
}
