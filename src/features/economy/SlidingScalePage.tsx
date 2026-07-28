import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ToolPage } from "./tools/ToolPage";
import { usePrintDocument } from "./tools/usePrintDocument";
import { useIssuer } from "./tools/useIssuer";
import { SlidingScaleForm } from "./SlidingScaleForm";
import { SlidingScalePreview } from "./SlidingScalePreview";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DEFAULT_SCALE, type SlidingScale } from "./slidingScale.data";

/**
 * Client-side sliding-scale price-card generator. A maker frames an ethical
 * pay-what-fits scale (Supported / Standard / Solidarity) and exports a branded,
 * printable card via the browser's print-to-PDF.
 */
export function SlidingScalePage() {
  const { t } = useTranslation();
  const [scale, setScale] = useState<SlidingScale>(DEFAULT_SCALE);
  const [issuer, updateIssuer] = useIssuer();
  const print = usePrintDocument();

  const update = (patch: Partial<SlidingScale>) =>
    setScale((prev) => ({ ...prev, ...patch }));

  const actions = (
    <Button
      variant="primary"
      size="lg"
      type="button"
      onClick={() => print(`sliding-scale-${scale.service || "card"}`)}
    >
      <FiDownload aria-hidden /> {t("economy:toolPage.downloadPdf")}
    </Button>
  );

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowCommunity")}
      title={
        <Translation
          i18nKey="economy:slidingScale.title"
          components={{ em: <em /> }}
        />
      }
      subtitle={t("economy:slidingScale.sub")}
      form={
        <SlidingScaleForm
          scale={scale}
          onChange={update}
          makerName={issuer.name}
          onMakerNameChange={(name) => updateIssuer({ name })}
        />
      }
      preview={<SlidingScalePreview scale={scale} makerName={issuer.name} />}
      actions={actions}
    />
  );
}
