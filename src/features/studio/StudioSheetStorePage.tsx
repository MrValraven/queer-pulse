import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import { StudioSheetPreview } from "./StudioSheetPreview";
import { StudioSheetCheckout } from "./StudioSheetCheckout";
import { StudioSheetAlso } from "./StudioSheetAlso";
import { SHEET_PRICE, SHEET_SPLIT_RATIO } from "./studioSheetStore.data";
import s from "./sheet.module.css";

export function StudioSheetStorePage() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:sheet.store.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:sheet.store.title"
            components={{ em: <em /> }}
          />
        </h1>
        <div className={s.dek}>
          <Translation
            i18nKey="studio:sheet.store.dek"
            components={{ em: <em /> }}
            values={{
              amount: fmt.currency(SHEET_PRICE),
              splitRatio: SHEET_SPLIT_RATIO,
            }}
          />
        </div>
      </div>

      <div className={s.grid}>
        <StudioSheetPreview />
        <StudioSheetCheckout />
      </div>

      <StudioSheetAlso />
    </StudioShell>
  );
}
