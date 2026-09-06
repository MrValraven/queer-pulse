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
import {
  classifyAppealWindowClosed,
  type AppealWindowClosedRefusal,
} from "./api/appealSubmissionError";
import type { SubmittedAppealDTO } from "./api/appeals.api";
// The single frontend mirror of the backend's `moderation/appeal-window.ts`.
// It lives beside the banned/suspended screens because those were the first to
// need it, and it is imported rather than re-declared here on purpose: two
// hand-copied mirrors of one server constant drift silently, and the number a
// suspended member reads on the screen that links here has to be the number
// they read on the form it links to.
import {
  APPEAL_DECISION_WINDOW_DAYS,
  APPEAL_FILING_WINDOW_DAYS,
} from "../system/accountWindows";
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
  // Guarded rather than trusted. `new Date(undefined)` renders as the literal
  // "Invalid Date" through `Intl`, and a backend that has not shipped the field
  // yet would put that string under a "Expected response" label on the page a
  // suspended member reads to find out when they will be heard. A missing row
  // says less than a wrong one.
  const dueAt = appeal.slaDueAt ? new Date(appeal.slaDueAt) : null;
  const dueDate =
    dueAt && !Number.isNaN(dueAt.getTime()) ? format.date(dueAt) : null;
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
      <p className={styles.successSub}>
        {t("safety:appealSubmit.success.sub")}
      </p>
      <div className={styles.refBoxes}>
        <div className={styles.refBox}>
          <span className={styles.refLabel}>
            {t("safety:appealSubmit.success.filedLabel")}
          </span>
          <span className={styles.refVal}>
            {format.date(new Date(appeal.createdAt))}
          </span>
        </div>
        {/* The decision deadline, stated at the one moment the member is
            certainly looking (PRD-286). It was computed and stored the instant
            this appeal was filed and simply not returned, so the promise the
            Code of Conduct publishes was invisible right where it counted. */}
        {dueDate ? (
          <div className={styles.refBox}>
            <span className={styles.refLabel}>
              {t("safety:appeal.pending.expectedLabel")}
            </span>
            <span className={styles.refVal}>{dueDate}</span>
          </div>
        ) : null}
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

/**
 * The refusal that is a state, not a fault: this decision is too old to appeal.
 *
 * Rendered in place, above the submit, with the deadline in it. A toast was the
 * wrong shape for it. The window has closed permanently, so the message has to
 * stay on screen while the member reads what to do instead, and pressing submit
 * again can only produce the same answer. `role="alert"` announces it, since it
 * appears in response to the member's own action and nothing else moves.
 */
function AppealWindowClosedNotice({
  refusal,
}: {
  refusal: AppealWindowClosedRefusal;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  // The server's own enforced number wins over the mirrored constant, so the
  // figure a refused member reads is always the figure that refused them.
  const days = refusal.windowDays ?? APPEAL_FILING_WINDOW_DAYS;
  return (
    <div className={styles.windowClosed} role="alert">
      <p className={styles.windowClosedTitle}>
        {t("safety:appealSubmit.windowClosed.title")}
      </p>
      <p className={styles.windowClosedBody}>
        {refusal.closedAt
          ? t("safety:appealSubmit.windowClosed.body", {
              days,
              date: format.date(refusal.closedAt),
            })
          : t("safety:appealSubmit.windowClosed.bodyNoDate", { days })}
      </p>
      <Button variant="ghost" to={routes.contact}>
        {t("safety:appealSubmit.windowClosed.contactCta")}
      </Button>
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
  const [windowClosed, setWindowClosed] =
    useState<AppealWindowClosedRefusal | null>(null);

  const trimmedLength = reason.trim().length;
  const canSubmit =
    trimmedLength >= MIN_REASON_LENGTH &&
    !submitAppeal.isPending &&
    // Once the window is shut, every further attempt gets the identical
    // refusal. The notice sits directly above the button and says why, so this
    // stops a member re-sending into a wall rather than disabling in silence.
    !windowClosed;
  // A specific action id can be deep-linked from the enforcement notification;
  // absent, the backend resolves the latest action against the member.
  const actionId = searchParams.get("action") ?? undefined;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    submitAppeal.mutate(
      { reason: reason.trim(), actionId },
      {
        onError: (error) => {
          // A late filing is a permanent state with a date in it, so it gets a
          // panel that stays put. Read from the backend's typed `code`, never
          // its sentence: see `api/appealSubmissionError.ts`.
          const closed = classifyAppealWindowClosed(error);
          if (closed) {
            setWindowClosed(closed);
            return;
          }
          // Everything else stays a toast carrying the specific backend reason
          // (e.g. a 409 "you already have an appeal awaiting review") rather
          // than faking success.
          showToast(
            describeError(t("safety:appealSubmit.errorFrame"), error),
            "error",
            6000,
          );
        },
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

      {/* TS-11. The Code of Conduct publishes a filing window and this page
          used to omit it, so a member met the limit only by being refused on
          day 15. It is stated before the textarea, because a deadline is only
          useful to somebody who has not started writing yet.

          The copy states the WINDOW and never a computed closing date. Two
          reasons, both from the server. The clock starts at the moderation
          action's own timestamp, which this form does not have. And a decision
          old enough to leave no audit row carries NO deadline at all: the
          backend lets that filing through untouched rather than refusing on an
          invented one, so a date printed here would be a bar the server does
          not enforce. Only the server ever says a window has closed, and it
          says so with `APPEAL_WINDOW_CLOSED` and the date it shut. */}
      <p className={styles.filingWindow}>
        {t("safety:appealSubmit.filingWindow", {
          days: APPEAL_FILING_WINDOW_DAYS,
        })}
      </p>

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
            values={{ days: APPEAL_DECISION_WINDOW_DAYS }}
            components={{ b: <b /> }}
          />
        </p>

        {windowClosed ? (
          <AppealWindowClosedNotice refusal={windowClosed} />
        ) : null}

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
