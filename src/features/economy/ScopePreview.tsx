import { FiCheck, FiX } from "react-icons/fi";
import { DocPreview } from "./tools/DocPreview";
import type { Issuer } from "./tools/useIssuer";
import { euro } from "./economy.data";
import { formatDate } from "../../shared/lib/date";
import { TAX_DISCLAIMER } from "./tax.constants";
import type { ScopeState } from "./scope.data";
import styles from "./ScopeGeneratorPage.module.css";

/** Reword the shared tax disclaimer as a general scope/quote disclaimer. */
const SCOPE_DISCLAIMER =
  "This document is a working scope, not a binding contract. Anything not listed under " +
  "“What's included” is out of scope and quoted separately. " +
  TAX_DISCLAIMER;

interface ScopePreviewProps {
  scope: ScopeState;
  issuer: Issuer;
}

/** The branded, printable scope/quote document. */
export function ScopePreview({ scope, issuer }: ScopePreviewProps) {
  const priceNum = Number(scope.price);
  const hasPrice = scope.price.trim() !== "" && Number.isFinite(priceNum);
  const deliverables = scope.deliverables.filter((d) => d.trim());
  const exclusions = scope.outOfScope.filter((d) => d.trim());
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DocPreview>
      <header className={styles.docHead}>
        <div>
          <p className={styles.docIssuer}>{issuer.name || "Your name"}</p>
          {issuer.email && <p className={styles.docMeta}>{issuer.email}</p>}
        </div>
        <p className={styles.docKind}>{hasPrice ? "Quote" : "Scope of Work"}</p>
      </header>

      <h2 className={styles.docTitle}>{scope.project || "Untitled project"}</h2>
      <p className={styles.docSubMeta}>
        {scope.clientName ? `For ${scope.clientName}` : "For your client"} ·{" "}
        {today}
      </p>

      <section className={styles.docSection}>
        <h3 className={styles.docHeading}>What&apos;s included</h3>
        {deliverables.length > 0 ? (
          <ul className={styles.docList}>
            {deliverables.map((d, i) => (
              <li key={`inc-${i}`} className={styles.docItem}>
                <FiCheck className={styles.iconYes} aria-hidden />{" "}
                <span>{d}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.docEmpty}>Add at least one deliverable.</p>
        )}
      </section>

      {exclusions.length > 0 && (
        <section className={styles.docSection}>
          <h3 className={styles.docHeading}>Not included</h3>
          <ul className={styles.docList}>
            {exclusions.map((d, i) => (
              <li key={`exc-${i}`} className={styles.docItemMuted}>
                <FiX className={styles.iconNo} aria-hidden /> <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {scope.revisions.trim() && (
        <section className={styles.docSection}>
          <h3 className={styles.docHeading}>Revisions</h3>
          <p className={styles.docText}>{scope.revisions}</p>
        </section>
      )}

      {scope.milestones.trim() && (
        <section className={styles.docSection}>
          <h3 className={styles.docHeading}>Milestones &amp; terms</h3>
          <p className={styles.docText}>{scope.milestones}</p>
        </section>
      )}

      {hasPrice && (
        <div className={styles.docPrice}>
          <span className={styles.docPriceLabel}>Total</span>
          <span className={styles.docPriceValue}>{euro(priceNum)}</span>
        </div>
      )}

      {scope.validUntil && (
        <p className={styles.docValid}>
          Valid until {formatDate(scope.validUntil)}
        </p>
      )}

      <footer className={styles.docFoot}>{SCOPE_DISCLAIMER}</footer>
    </DocPreview>
  );
}
