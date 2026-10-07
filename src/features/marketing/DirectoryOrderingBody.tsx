import { FiExternalLink, FiInfo } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { websiteHref, websiteLabel } from "./directoryPlaces";
import {
  INLINE_ORDERING_FACT_IDS,
  orderingFacts,
  type OrderingLine,
} from "./directoryOrdering.data";
import {
  MAIN_LINK_ACTION_KEYS,
  ONLINE_LINK_PLATFORM_DEFINITIONS,
  type ListingPublicOnlineDetails,
} from "./listBusiness/listingOnline.data";
import styles from "./DirectoryOrdering.module.css";

/**
 * The body of "Ordering & delivery": the main link as the one primary action,
 * the other places the business sells, then the facts in page order. Shared
 * by the detail page and the editor's full preview, so both read the same
 * cleaned block. Every link leaves the site in a new tab.
 */
export function DirectoryOrderingBody({
  details,
}: {
  details: ListingPublicOnlineDetails;
}) {
  const { t } = useTranslation();
  const facts = orderingFacts(details);
  const lineText = (line: OrderingLine) =>
    line.kind === "text"
      ? line.text
      : t(line.key, line.kind === "key" ? line.values : undefined);

  return (
    <div className={styles.body}>
      {details.mainLink && (
        <Button
          variant="primary"
          href={websiteHref(details.mainLink.url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t(MAIN_LINK_ACTION_KEYS[details.mainLink.kind])}
          <FiExternalLink aria-hidden />
          <span className="visuallyHidden">
            {" "}
            {t("marketing:directory.detail.ordering.newTab")}
          </span>
        </Button>
      )}

      {details.moreLinks.length > 0 && (
        <div className={styles.alsoOn}>
          <span className={styles.alsoOnLabel}>
            {t("marketing:directory.detail.ordering.alsoOn")}
          </span>
          <ul className={styles.links}>
            {details.moreLinks.map((link) => {
              const platform = ONLINE_LINK_PLATFORM_DEFINITIONS[link.platform];
              const PlatformIcon = platform.icon;
              return (
                <li key={`${link.platform}-${link.url}`}>
                  <a
                    className={styles.link}
                    href={websiteHref(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PlatformIcon aria-hidden />
                    {link.platform === "other"
                      ? websiteLabel(link.url)
                      : t(platform.labelKey)}
                    <span className="visuallyHidden">
                      {" "}
                      {t("marketing:directory.detail.ordering.newTab")}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {facts.length > 0 && (
        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.id} className={styles.fact}>
              <dt className={styles.factLabel}>{t(fact.labelKey)}</dt>
              {INLINE_ORDERING_FACT_IDS.has(fact.id) ? (
                <dd className={styles.factLine}>
                  {fact.lines.map(lineText).join(" · ")}
                </dd>
              ) : (
                fact.lines.map((line, index) =>
                  // Index-keyed: a fact's lines are read-only and never reorder.
                  line.kind === "note" ? (
                    <dd key={index} className={styles.factNote}>
                      <FiInfo aria-hidden />
                      <span>{lineText(line)}</span>
                    </dd>
                  ) : (
                    <dd key={index} className={styles.factLine}>
                      {lineText(line)}
                    </dd>
                  ),
                )
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
