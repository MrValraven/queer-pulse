import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { useSubmitAppeal } from "./api/useSubmitAppeal";
import type { SubmittedAppealDTO } from "./api/appeals.api";
import { QuickExit } from "./QuickExit";
import styles from "./AppealSubmitPage.module.css";

/** Matches the backend `CreateAppealDto` `@MinLength(20)` — the submit stays
 *  disabled until the member has written a case a moderator can act on. */
const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 4000;

/** The plum-panel confirmation shown once the appeal is filed. */
function AppealFiledPanel({ appeal }: { appeal: SubmittedAppealDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <div className={styles.successCard}>
      <div className={styles.successIcon}>
        <FiCheck />
      </div>
      <h1 className={styles.successTitle}>
        <Translation
          i18nKey="safety:appealSubmit.success.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.successSub}>{t("safety:appealSubmit.success.sub")}</p>
      <div className={styles.refBox}>
        <span className={styles.refLabel}>
          {t("safety:appealSubmit.success.filedLabel")}
        </span>
        <span className={styles.refVal}>
          {format.date(new Date(appeal.createdAt))}
        </span>
      </div>
      <div className={styles.successActions}>
        <Button variant="ghost-dark" to={routes.appealOutcome}>
          {t("safety:appealSubmit.success.trackCta")}
        </Button>
        <Button variant="ghost-dark" to={routes.governance}>
          {t("safety:appealSubmit.success.howCta")}
        </Button>
      </div>
    </div>
  );
}

/** The appeal form: a single required free-text case, with a live counter. */
function AppealForm({
  submitAppeal,
}: {
  submitAppeal: ReturnType<typeof useSubmitAppeal>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [reason, setReason] = useState("");

  const trimmedLength = reason.trim().length;
  const canSubmit = trimmedLength >= MIN_REASON_LENGTH && !submitAppeal.isPending;
  // A specific action id can be deep-linked from the enforcement notification;
  // absent, the backend resolves the latest action against the member.
  const actionId = searchParams.get("action") ?? undefined;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    submitAppeal.mutate(
      { reason: reason.trim(), actionId },
      {
        // On failure, surface the specific backend reason (e.g. a 409 "you
        // already have an appeal awaiting review") rather than faking success.
        onError: (error) =>
          showToast(
            describeError(t("safety:appealSubmit.errorFrame"), error),
            "error",
            6000,
          ),
      },
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.kicker}>{t("safety:appealSubmit.kicker")}</div>
      <h1 className={styles.heading}>
        <Translation
          i18nKey="safety:appealSubmit.heading"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.lead}>{t("safety:appealSubmit.lead")}</p>

      <form className={styles.form} onSubmit={onSubmit}>
        <FormField
          label={t("safety:appealSubmit.form.reasonLabel")}
          helper={t("safety:appealSubmit.form.reasonHelper")}
          labelAside={
            <span className={styles.charCount}>
              {t("safety:appealSubmit.form.charCount", {
                count: trimmedLength,
                max: MAX_REASON_LENGTH,
              })}
            </span>
          }
        >
          <textarea
            value={reason}
            maxLength={MAX_REASON_LENGTH}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("safety:appealSubmit.form.reasonPlaceholder")}
          />
        </FormField>

        <p className={styles.notice}>
          <Translation
            i18nKey="safety:appealSubmit.notice"
            components={{ b: <b /> }}
          />
        </p>

        <div className={styles.actions}>
          <Button variant="primary" type="submit" disabled={!canSubmit}>
            {submitAppeal.isPending
              ? t("safety:appealSubmit.form.submitting")
              : t("safety:appealSubmit.form.submitCta")}
          </Button>
          <Button variant="ghost" to={routes.codeOfConduct}>
            {t("safety:appealSubmit.form.ladderCta")}
          </Button>
        </div>
      </form>

      <p className={styles.foot}>
        <Translation
          i18nKey="safety:appealSubmit.foot"
          components={{ a: <Link to={routes.governance} /> }}
        />
      </p>
    </div>
  );
}

/** Member-facing appeal submission. Reachable by a suspended / banned member
 *  (the backend guards `POST /appeals` with the deliberate `ActiveMemberGuard`
 *  exception), so it uses the full-screen system shell like the suspended and
 *  banned screens that link here. */
export function AppealSubmitPage() {
  const submitAppeal = useSubmitAppeal();

  return (
    <SystemStateShell orbTone="plum">
      {submitAppeal.data ? (
        <AppealFiledPanel appeal={submitAppeal.data} />
      ) : (
        <AppealForm submitAppeal={submitAppeal} />
      )}
      <QuickExit />
    </SystemStateShell>
  );
}
