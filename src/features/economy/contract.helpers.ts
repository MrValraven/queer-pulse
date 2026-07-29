import {
  CLAUSES,
  DOC_STRINGS,
  type ContractCtx,
  type Lang,
} from "./contract.data";

/* Non-component helpers split out of ContractPreview.tsx so that file only
 * exports its component (react-refresh/only-export-components). */

export const dash = "—";
export const show = (value: string, fallback: string) =>
  value.trim() || fallback;

/** The clauses currently selected, in library order. */
export function activeClauses(selected: string[]) {
  return CLAUSES.filter((clause) => selected.includes(clause.id));
}

/**
 * Assemble the entire contract as plain text for the "Copy text" action,
 * in the chosen language. Mirrors the on-screen document order.
 */
export function contractToText(
  ctx: ContractCtx,
  selected: string[],
  lang: Lang,
): string {
  const S = DOC_STRINGS[lang];
  const lines: string[] = [];
  lines.push(S.title.toUpperCase(), "");
  lines.push(
    `${S.between} ${show(ctx.providerName, S.providerFallback)}` +
      (ctx.providerNif.trim() ? ` (NIF ${ctx.providerNif.trim()})` : "") +
      ` ${S.and} ${show(ctx.clientName, S.clientFallback)}` +
      (ctx.clientNif.trim() ? ` (NIF ${ctx.clientNif.trim()})` : "") +
      ".",
    "",
  );
  lines.push(S.projectScope.toUpperCase());
  lines.push(show(ctx.project, dash));
  if (ctx.scope.trim()) lines.push(ctx.scope.trim());
  lines.push("");
  lines.push(S.feePayment.toUpperCase());
  lines.push(`${S.fee}: ${show(ctx.fee, dash)}`);
  lines.push(`${S.paymentTerms}: ${show(ctx.paymentTerms, dash)}`);
  lines.push("");
  lines.push(S.timeline.toUpperCase());
  lines.push(show(ctx.timeline, dash), "");

  activeClauses(selected).forEach((clause, i) => {
    lines.push(`${i + 1}. ${clause.label[lang].toUpperCase()}`);
    lines.push(clause.body[lang](ctx), "");
  });

  lines.push(S.governedBy(show(ctx.governingLaw, "Portugal")), "");
  lines.push(
    `${S.provider}: ${show(ctx.providerName, "________________")}    ${S.date}: ____________`,
  );
  lines.push(
    `${S.client}: ${show(ctx.clientName, "________________")}    ${S.date}: ____________`,
    "",
  );
  lines.push(S.disclaimer);
  return lines.join("\n");
}
