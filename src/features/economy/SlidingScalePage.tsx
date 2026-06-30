import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ToolPage } from "./tools/ToolPage";
import { usePrintDocument } from "./tools/usePrintDocument";
import { useIssuer } from "./tools/useIssuer";
import { SlidingScaleForm } from "./SlidingScaleForm";
import { SlidingScalePreview } from "./SlidingScalePreview";
import { DEFAULT_SCALE, type SlidingScale } from "./slidingScale.data";

/**
 * Client-side sliding-scale price-card generator. A maker frames an ethical
 * pay-what-fits scale (Supported / Standard / Solidarity) and exports a branded,
 * printable card via the browser's print-to-PDF.
 */
export function SlidingScalePage() {
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
      <FiDownload aria-hidden /> Download PDF
    </Button>
  );

  return (
    <ToolPage
      eyebrow="Community"
      title={
        <>
          Price with <em>solidarity.</em>
        </>
      }
      sub="Publish a sliding scale so people pay what fits their means — and you still get paid fairly. Export a card to share."
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
