import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button } from "../../shared/components/ui";
import styles from "./IssuesPage.module.css";

const ISSUE = routes.issue;
/** The hardcoded "current issue" showcase is fabricated issue-09 copy with no
 *  backend analogue, so it renders in demo mode only. */
const CURRENT_ISSUE_NUMBER = "09";
const CURRENT_ISSUE_PUBLISHED = new Date(2026, 5, 6);

/** Featured current-issue block (plum panel) — demo-only showcase. */
export function CurrentIssueSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.current}>
      <div className={styles.curInner}>
        <div className={styles.curImg}>
          {t("magazine:issues.current.coverPlaceholder", {
            number: CURRENT_ISSUE_NUMBER,
          })}
        </div>
        <div>
          <div className={styles.curEyebrow}>
            {t("magazine:issues.current.eyebrow", {
              date: fmt.date(CURRENT_ISSUE_PUBLISHED),
            })}
          </div>
          <div className={styles.curNum}>
            <Translation
              i18nKey="magazine:issue.badge"
              values={{ number: CURRENT_ISSUE_NUMBER }}
              components={{ em: <em /> }}
            />
          </div>
          {/* Content: the current issue's own title/dek, kept in English. */}
          {/* eslint-disable local/no-literal-string -- current issue's own theme line, no backend analogue in demo mode */}
          <h2 className={styles.curH}>
            On <em>health.</em>
          </h2>
          <p className={styles.curDek}>
            Twelve pieces about how we keep our bodies, our minds, and each
            other. Reported, debated, illustrated.
          </p>
          {/* eslint-enable local/no-literal-string */}
          <div className={styles.curMeta}>
            <span>{t("magazine:issue.stats.pagesCount", { count: 84 })}</span>
            <span>
              {t("magazine:issue.stats.featuresCount", { count: 12 })}
            </span>
            <span>
              {t("magazine:issue.stats.contributorsCount", { count: 8 })}
            </span>
          </div>
          <div className={styles.curActions}>
            <Button to={`${ISSUE}/${CURRENT_ISSUE_NUMBER}`} variant="primary">
              {t("magazine:issue.readCta", { number: CURRENT_ISSUE_NUMBER })}{" "}
              <FiArrowRight aria-hidden />
            </Button>
            <Button to={requestInvitePath("magazine")} variant="ghost-dark">
              {t("magazine:issue.orderPrintCta", {
                price: fmt.currency(8),
              })}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
