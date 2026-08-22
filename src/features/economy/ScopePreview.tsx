import { FiCheck, FiX } from "react-icons/fi";
import { DocPreview } from "./tools/DocPreview";
import type { Issuer } from "./tools/useIssuer";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { TAX_DISCLAIMER_KEY } from "./tax.constants";
import type { ScopeState } from "./scope.data";
import styles from "./ScopeGeneratorPage.module.css";

interface ScopePreviewProps {
  scope: ScopeState;
  issuer: Issuer;
}

/** The branded, printable scope/quote document. */
export function ScopePreview({ scope, issuer }: ScopePreviewProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const priceNum = Number(scope.price);
  const hasPrice = scope.price.trim() !== "" && Number.isFinite(priceNum);
  const deliverables = scope.deliverables.filter((d) => d.trim());
  const exclusions = scope.outOfScope.filter((d) => d.trim());
  const today = fmt.date(new Date(), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const scopeDisclaimer = `${t("economy:scopeTool.disclaimer")} ${t(TAX_DISCLAIMER_KEY)}`;

  return (
    <DocPreview>
      <header className={styles.docHead}>
        <div>
          <p className={styles.docIssuer}>
            {issuer.name || t("economy:scopeTool.preview.yourNameFallback")}
          </p>
          {issuer.email && <p className={styles.docMeta}>{issuer.email}</p>}
        </div>
        <p className={styles.docKind}>
          {hasPrice
            ? t("economy:scopeTool.preview.quote")
            : t("economy:scopeTool.preview.scopeOfWork")}
        </p>
      </header>

      <h2 className={styles.docTitle}>
        {scope.project || t("economy:scopeTool.preview.untitledProject")}
      </h2>
      <p className={styles.docSubMeta}>
        {scope.clientName
          ? t("economy:scopeTool.preview.forClient", {
              client: scope.clientName,
            })
          : t("economy:scopeTool.preview.forYourClient")}{" "}
        · {today}
      </p>

      <section className={styles.docSection}>
        <h3 className={styles.docHeading}>
          {t("economy:scopeTool.preview.included")}
        </h3>
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
          <p className={styles.docEmpty}>
            {t("economy:scopeTool.preview.addDeliverable")}
          </p>
        )}
      </section>

      {exclusions.length > 0 && (
        <section className={styles.docSection}>
          <h3 className={styles.docHeading}>
            {t("economy:scopeTool.preview.notIncluded")}
          </h3>
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
          <h3 className={styles.docHeading}>
            {t("economy:scopeTool.preview.revisions")}
          </h3>
          <p className={styles.docText}>{scope.revisions}</p>
        </section>
      )}

      {scope.milestones.trim() && (
        <section className={styles.docSection}>
          <h3 className={styles.docHeading}>
            {t("economy:scopeTool.preview.milestones")}
          </h3>
          <p className={styles.docText}>{scope.milestones}</p>
        </section>
      )}

      {hasPrice && (
        <div className={styles.docPrice}>
          <span className={styles.docPriceLabel}>
            {t("economy:scopeTool.preview.total")}
          </span>
          <span className={styles.docPriceValue}>{fmt.currency(priceNum)}</span>
        </div>
      )}

      {scope.validUntil && (
        <p className={styles.docValid}>
          {t("economy:scopeTool.preview.validUntil", {
            date: fmt.date(new Date(scope.validUntil)),
          })}
        </p>
      )}

      <footer className={styles.docFoot}>{scopeDisclaimer}</footer>
    </DocPreview>
  );
}
