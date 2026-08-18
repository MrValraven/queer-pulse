import { useState } from "react";
import { Badge, Button, FormField, type BadgeTone } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { logError } from "../../shared/observability/logger";
import { useListDsar, useSubmitDsar } from "../settings/api/useDsar";
import type { DsarArticle, DsarStatus } from "../settings/api/account.api";
import styles from "./AccountData.module.css";

/** Confirmed against the backend `SubmitDsarDto` (`@IsIn([15, 16, 17, 21])`,
 *  `queerpulse-backend/src/account/dto/submit-dsar.dto.ts`) — access (15),
 *  rectification (16), erasure (17), objection (21). */
const ARTICLES: DsarArticle[] = [15, 16, 17, 21];

const ARTICLE_LABEL_KEY: Record<DsarArticle, string> = {
  15: "members:profile.accountData.dsar.article.access",
  16: "members:profile.accountData.dsar.article.rectification",
  17: "members:profile.accountData.dsar.article.erasure",
  21: "members:profile.accountData.dsar.article.objection",
};

/** Shares the `Badge` status-pill primitive rather than declaring a new one —
 *  the same component the export job status and the deletion-pending banner
 *  reach for elsewhere in this sheet. */
const STATUS_TONE: Record<DsarStatus, BadgeTone> = {
  received: "ghost",
  in_review: "amber",
  resolved: "jade",
  rejected: "danger",
};

const STATUS_LABEL_KEY: Record<DsarStatus, string> = {
  received: "members:profile.accountData.dsar.status.received",
  in_review: "members:profile.accountData.dsar.status.inReview",
  resolved: "members:profile.accountData.dsar.status.resolved",
  rejected: "members:profile.accountData.dsar.status.rejected",
};

/**
 * Full default scope. The compact sheet doesn't expose the full page's
 * per-category scope checklist (`/policies/privacy/data-request`,
 * `DsarPage.tsx`'s `SCOPES`) — filing here always requests everything the
 * backend can act on for the chosen right. `SubmitDsarDto.scopes` has no
 * fixed backend enum (`@IsArray() @IsString({ each: true })` only), so these
 * ids only need to stay stable for staff-side tooling reading them, not for
 * server-side validation.
 */
const DEFAULT_SCOPES = ["profile", "connections", "activity", "moderation"];

/**
 * DSAR intake + history, compacted for the sheet: an article picker (15/16/17/21,
 * confirmed against the backend enum above) plus a details field posting to
 * `POST /account/dsar`, and the existing-request list from `GET /account/dsar`
 * below it. For scope-level control, `marketing:dsar` (`DsarPage`) remains the
 * full surface.
 */
export function AccountDataDsar() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const submitDsar = useSubmitDsar();
  const { requests, loading, failed } = useListDsar();

  const [article, setArticle] = useState<DsarArticle>(15);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const detailsValid = details.trim().length > 0;

  async function handleSubmit() {
    if (!detailsValid || submitting) return;
    setSubmitting(true);
    try {
      const created = await submitDsar({
        article,
        scopes: DEFAULT_SCOPES,
        details: details.trim(),
      });
      showToast(
        t("members:profile.accountData.dsar.toast.submitted", {
          ref: created.reference,
        }),
        "success",
      );
      setDetails("");
    } catch (err) {
      logError(err, { where: "AccountDataDsar.submit" });
      showToast(
        t("members:profile.accountData.dsar.toast.submitError"),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>
        {t("members:profile.accountData.dsar.title")}
      </h3>
      <p className={styles.body}>
        {t("members:profile.accountData.dsar.intro")}
      </p>

      <div
        className={styles.articleGroup}
        role="group"
        aria-label={t("members:profile.accountData.dsar.articleGroupLabel")}
      >
        {ARTICLES.map((art) => (
          <Button
            key={art}
            type="button"
            variant={article === art ? "primary" : "ghost"}
            size="sm"
            aria-pressed={article === art}
            onClick={() => setArticle(art)}
          >
            {t(ARTICLE_LABEL_KEY[art])}
          </Button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <FormField label={t("members:profile.accountData.dsar.detailsLabel")}>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={t(
              "members:profile.accountData.dsar.detailsPlaceholder",
            )}
          />
        </FormField>
        <Button
          variant="primary"
          type="submit"
          disabled={!detailsValid || submitting}
        >
          {submitting
            ? t("members:profile.accountData.dsar.submitting")
            : t("members:profile.accountData.dsar.submitCta")}
        </Button>
      </form>

      <div className={styles.block}>
        <h4 className={styles.subheading}>
          {t("members:profile.accountData.dsar.pastTitle")}
        </h4>
        {loading && (
          <p className={styles.hint}>
            {t("members:profile.accountData.dsar.pastLoading")}
          </p>
        )}
        {failed && (
          <p className={styles.hint}>
            {t("members:profile.accountData.dsar.pastError")}
          </p>
        )}
        {!loading && !failed && requests.length === 0 && (
          <p className={styles.hint}>
            {t("members:profile.accountData.dsar.pastEmpty")}
          </p>
        )}
        {!loading && !failed && requests.length > 0 && (
          <ul className={styles.pastList}>
            {requests.map((request) => (
              <li key={request.reference} className={styles.pastRow}>
                <span className={styles.pastRowRef}>{request.reference}</span>
                <span>{t(ARTICLE_LABEL_KEY[request.article])}</span>
                <span className={styles.pastRowMeta}>
                  {fmt.date(new Date(request.submittedAt), {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <Badge tone={STATUS_TONE[request.status]} dot>
                  {t(STATUS_LABEL_KEY[request.status])}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
