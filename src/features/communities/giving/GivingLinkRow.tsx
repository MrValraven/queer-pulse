import { createElement } from "react";
import { FiExternalLink } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { safeHref } from "../../../shared/lib/safeHref";
import type { CommunityGivingMethodDTO } from "../api/communityGiving.api";
import {
  givingLinkHost,
  givingMethodIcon,
  givingMethodTitle,
} from "./givingPlatforms";
import { normalizeGivingLink } from "./givingValue";
import styles from "./Giving.module.css";

/** The stored link when it is a safe https href, else null. Both guards run:
 *  `safeHref` keeps dangerous schemes out of the DOM, `normalizeGivingLink`
 *  holds the stored value to the editor's https-only rule. */
function givingLinkHref(value: string): string | null {
  const safeValue = safeHref(value);
  if (safeValue === null) return null;
  return normalizeGivingLink(safeValue) === safeValue ? safeValue : null;
}

/** An outbound way to support: platform icon, title, host and the new-tab
 *  cue. A stored value that cannot be a safe link reads as plain text.
 *  Nothing counts a click. */
export function GivingLinkRow({
  method,
}: {
  method: CommunityGivingMethodDTO;
}) {
  const { t } = useTranslation();
  const title = givingMethodTitle(method);
  const href = givingLinkHref(method.value);
  const host = givingLinkHost(method.value);
  const subtitle = host ?? (title === method.value ? null : method.value);

  const body = (
    <>
      {createElement(givingMethodIcon(method), {
        "aria-hidden": true,
        className: styles.icon,
      })}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {subtitle !== null && (
          <span className={styles.subtitle}>{subtitle}</span>
        )}
      </span>
    </>
  );

  if (href === null) {
    return <span className={styles.row}>{body}</span>;
  }

  return (
    <a
      className={`${styles.row} ${styles.linkRow}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {body}
      <FiExternalLink aria-hidden className={styles.external} />
      <span className="visuallyHidden">
        {t("communities:detail.giving.opensInNewTab")}
      </span>
    </a>
  );
}
