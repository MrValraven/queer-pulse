import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type Piece } from "./editorDashboard.data";
import { cx } from "../../shared/lib/cx";
import { SideCard } from "./SideCard";
import styles from "./EditorDashboardPage.module.css";

/** Contributor mix, pay status, geography, and live search match. */
export function ContributorMixCard({
  pieces,
  query,
}: {
  pieces: Piece[];
  query: string;
}) {
  const { t } = useTranslation();
  const queryLower = query.toLowerCase();
  const matches = queryLower
    ? [...new Set(pieces.map((piece) => piece.author))].filter((author) =>
        author.toLowerCase().includes(queryLower),
      )
    : [];

  return (
    <SideCard title={t("magazine:editor.sideCards.contributorsHeading")}>
      {/* This aggregate role/geography breakdown is mock analytics content
          (would come from an API stats endpoint in live mode) — left as-is. */}
      <div className={styles.mixRow}>
        <b>11</b>
        <span>contributors · 8 writers · 2 illustrators · 1 photographer</span>
      </div>
      <div className={styles.mixSplit}>
        <div className={styles.mixCell}>
          <b className={styles.jade}>4</b>
          <span>{t("magazine:editor.sideCards.newVoices")}</span>
        </div>
        <div className={styles.mixCell}>
          <b>7</b>
          <span>{t("magazine:editor.sideCards.returning")}</span>
        </div>
      </div>
      <div className={styles.pay}>
        <div className={styles.payHead}>
          {t("magazine:editor.sideCards.contributorPay")}
        </div>
        <div className={styles.payBar}>
          <span
            className={cx(styles.paySeg, styles.paid)}
            style={{ width: "33%" }}
          />
          <span
            className={cx(styles.paySeg, styles.inv)}
            style={{ width: "25%" }}
          />
          <span
            className={cx(styles.paySeg, styles.none)}
            style={{ width: "42%" }}
          />
        </div>
        <div className={styles.payKey}>
          <span>
            <i className={styles.paid} />4 {t("magazine:editor.sideCards.paid")}
          </span>
          <span>
            <i className={styles.inv} />3{" "}
            {t("magazine:editor.sideCards.awaiting")}
          </span>
          <span>
            <i className={styles.none} />5{" "}
            {t("magazine:editor.sideCards.toInvoice")}
          </span>
        </div>
      </div>
      <div className={styles.geo}>
        Lisbon 6 · Porto 2 · Madrid 1 · Faro 1 · Berlin 1
      </div>
      {queryLower && (
        <div className={styles.contribMatch}>
          {matches.length
            ? t("magazine:editor.sideCards.matching", {
                names: matches.join(", "),
              })
            : t("magazine:editor.sideCards.noContributorMatch")}
        </div>
      )}
      <Link to={routes.author} className={styles.contribLink}>
        {t("magazine:editor.sideCards.seeContributorProfiles")}{" "}
        <FiArrowRight aria-hidden />
      </Link>
    </SideCard>
  );
}
