import { useState } from "react";
import { FiCopy, FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ToolPage } from "./tools/ToolPage";
import { usePrintDocument } from "./tools/usePrintDocument";
import { useIssuer } from "./tools/useIssuer";
import { euro } from "./economy.data";
import { TAX_DISCLAIMER } from "./tax.constants";
import { ScopeForm } from "./ScopeForm";
import { ScopePreview } from "./ScopePreview";
import { DEFAULT_SCOPE, type ScopeState } from "./scope.data";

/** Assemble a plain-text version of the scope for the "Copy text" action. */
function toPlainText(scope: ScopeState, issuerName: string): string {
  const priceNum = Number(scope.price);
  const hasPrice = scope.price.trim() !== "" && Number.isFinite(priceNum);
  const lines: string[] = [];

  lines.push(hasPrice ? "QUOTE" : "SCOPE OF WORK");
  if (issuerName) lines.push(`From: ${issuerName}`);
  if (scope.clientName) lines.push(`For: ${scope.clientName}`);
  if (scope.project) lines.push(`Project: ${scope.project}`);
  lines.push("");

  lines.push("What's included");
  scope.deliverables
    .filter((d) => d.trim())
    .forEach((d) => lines.push(`  + ${d}`));
  lines.push("");

  lines.push("Not included");
  scope.outOfScope
    .filter((d) => d.trim())
    .forEach((d) => lines.push(`  - ${d}`));
  lines.push("");

  if (scope.revisions.trim()) lines.push(`Revisions: ${scope.revisions}`);
  if (scope.milestones.trim()) lines.push(`Terms: ${scope.milestones}`);
  if (hasPrice) lines.push(`Total: ${euro(priceNum)}`);
  if (scope.validUntil) lines.push(`Valid until: ${scope.validUntil}`);
  lines.push("");
  lines.push(TAX_DISCLAIMER);

  return lines.join("\n");
}

/**
 * Client-side scope-of-work / quote generator. Fills a branded, printable
 * document you can save as a PDF (browser print) or copy as plain text.
 */
export function ScopeGeneratorPage() {
  const { showToast } = useToast();
  const [scope, setScope] = useState<ScopeState>(DEFAULT_SCOPE);
  const [issuer] = useIssuer();
  const print = usePrintDocument();

  const update = (patch: Partial<ScopeState>) =>
    setScope((prev) => ({ ...prev, ...patch }));

  const copyText = () => {
    navigator.clipboard?.writeText(toPlainText(scope, issuer.name));
    showToast("Copied to clipboard", "success");
  };

  const actions = (
    <>
      <Button
        variant="primary"
        size="lg"
        type="button"
        onClick={() => print(`scope-${scope.project || "draft"}`)}
      >
        <FiDownload aria-hidden /> Download PDF
      </Button>
      <Button variant="ghost" size="lg" type="button" onClick={copyText}>
        <FiCopy aria-hidden /> Copy text
      </Button>
    </>
  );

  return (
    <ToolPage
      eyebrow="Freelance tools"
      title={
        <>
          Define the <em>scope.</em>
        </>
      }
      sub="A clear scope (and what's out of it) prevents most disputes. Build one, send a PDF."
      form={<ScopeForm scope={scope} onChange={update} />}
      preview={<ScopePreview scope={scope} issuer={issuer} />}
      actions={actions}
    />
  );
}
