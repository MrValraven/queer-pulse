import { useState } from "react";
import { FiCopy, FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ToolPage } from "./tools/ToolPage";
import { usePrintDocument } from "./tools/usePrintDocument";
import { useIssuer } from "./tools/useIssuer";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { TAX_DISCLAIMER } from "./tax.constants";
import { ScopeForm } from "./ScopeForm";
import { ScopePreview } from "./ScopePreview";
import { DEFAULT_SCOPE, type ScopeState } from "./scope.data";

/** Assemble a plain-text version of the scope for the "Copy text" action. */
function toPlainText(
  scope: ScopeState,
  issuerName: string,
  t: TFunction,
  currency: (value: number) => string,
): string {
  const priceNum = Number(scope.price);
  const hasPrice = scope.price.trim() !== "" && Number.isFinite(priceNum);
  const lines: string[] = [];

  lines.push(
    hasPrice
      ? t("economy:scopeTool.plainText.quote")
      : t("economy:scopeTool.plainText.scopeOfWork"),
  );
  if (issuerName)
    lines.push(t("economy:scopeTool.plainText.from", { name: issuerName }));
  if (scope.clientName)
    lines.push(
      t("economy:scopeTool.plainText.for", { name: scope.clientName }),
    );
  if (scope.project)
    lines.push(
      t("economy:scopeTool.plainText.project", { name: scope.project }),
    );
  lines.push("");

  lines.push(t("economy:scopeTool.plainText.included"));
  scope.deliverables
    .filter((d) => d.trim())
    .forEach((d) => lines.push(`  + ${d}`));
  lines.push("");

  lines.push(t("economy:scopeTool.plainText.notIncluded"));
  scope.outOfScope
    .filter((d) => d.trim())
    .forEach((d) => lines.push(`  - ${d}`));
  lines.push("");

  if (scope.revisions.trim())
    lines.push(
      t("economy:scopeTool.plainText.revisions", { value: scope.revisions }),
    );
  if (scope.milestones.trim())
    lines.push(
      t("economy:scopeTool.plainText.terms", { value: scope.milestones }),
    );
  if (hasPrice)
    lines.push(
      t("economy:scopeTool.plainText.total", { value: currency(priceNum) }),
    );
  if (scope.validUntil)
    lines.push(
      t("economy:scopeTool.plainText.validUntil", { date: scope.validUntil }),
    );
  lines.push("");
  lines.push(TAX_DISCLAIMER);

  return lines.join("\n");
}

/**
 * Client-side scope-of-work / quote generator. Fills a branded, printable
 * document you can save as a PDF (browser print) or copy as plain text.
 */
export function ScopeGeneratorPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [scope, setScope] = useState<ScopeState>(DEFAULT_SCOPE);
  const [issuer] = useIssuer();
  const print = usePrintDocument();

  const update = (patch: Partial<ScopeState>) =>
    setScope((prev) => ({ ...prev, ...patch }));

  const copyText = () => {
    navigator.clipboard?.writeText(
      toPlainText(scope, issuer.name, t, fmt.currency),
    );
    showToast(t("economy:toolPage.copiedToast"), "success");
  };

  const actions = (
    <>
      <Button
        variant="primary"
        size="lg"
        type="button"
        onClick={() => print(`scope-${scope.project || "draft"}`)}
      >
        <FiDownload aria-hidden /> {t("economy:toolPage.downloadPdf")}
      </Button>
      <Button variant="ghost" size="lg" type="button" onClick={copyText}>
        <FiCopy aria-hidden /> {t("economy:toolPage.copyText")}
      </Button>
    </>
  );

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowFreelance")}
      title={
        <Translation
          i18nKey="economy:scopeTool.title"
          components={{ em: <em /> }}
        />
      }
      subtitle={t("economy:scopeTool.sub")}
      form={<ScopeForm scope={scope} onChange={update} />}
      preview={<ScopePreview scope={scope} issuer={issuer} />}
      actions={actions}
    />
  );
}
