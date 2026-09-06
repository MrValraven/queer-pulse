import type { ReactNode } from "react";
import { FiCheckCircle, FiInbox, FiSearch, FiWifiOff } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./ConcernStatus.module.css";

/** One answer card: an icon, a headline, a sentence, and optional dates. */
function StatusState({
  icon,
  isDone = false,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  /** Jade treatment for the two states that mean a human has finished. */
  isDone?: boolean;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.state}>
      <span
        className={
          isDone
            ? `${styles.stateIcon} ${styles.stateIconDone}`
            : styles.stateIcon
        }
        aria-hidden
      >
        {icon}
      </span>
      <h2 className={styles.stateTitle}>{title}</h2>
      <p className={styles.stateBody}>{body}</p>
      {children}
    </div>
  );
}

/**
 * PRD-261. The four things a concern's reference code can say, plus the two
 * things a failed lookup can.
 *
 * Every state names DATES, because the whole complaint this fixes is that
 * silence after a report is indistinguishable from the report being lost. "We
 * have it, nobody has opened it yet, you sent it on the 3rd" is a worse answer
 * than "it is resolved" and a far better one than nothing.
 */
export function ConcernStatusResult({
  status,
  submittedAt,
  updatedAt,
}: {
  status: string;
  submittedAt: string;
  updatedAt: string | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();

  // `format.date` takes a Date, and both fields arrive as ISO 8601 strings.
  const dates = (
    <p className={styles.stateMeta}>
      {t("governance:concernStatus.meta.submitted", {
        date: format.date(new Date(submittedAt)),
      })}
      {updatedAt
        ? ` · ${t("governance:concernStatus.meta.updated", {
            date: format.date(new Date(updatedAt)),
          })}`
        : ""}
    </p>
  );

  if (status === "resolved") {
    return (
      <StatusState
        icon={<FiCheckCircle />}
        isDone
        title={t("governance:concernStatus.resolved.title")}
        body={t("governance:concernStatus.resolved.body")}
      >
        {dates}
      </StatusState>
    );
  }
  if (status === "dismissed") {
    return (
      <StatusState
        icon={<FiCheckCircle />}
        isDone
        title={t("governance:concernStatus.dismissed.title")}
        body={t("governance:concernStatus.dismissed.body")}
      >
        {dates}
      </StatusState>
    );
  }
  if (status === "reviewing") {
    return (
      <StatusState
        icon={<FiSearch />}
        title={t("governance:concernStatus.reviewing.title")}
        body={t("governance:concernStatus.reviewing.body")}
      >
        {dates}
      </StatusState>
    );
  }
  // `new`, and anything a future backend adds: received, nobody has moved it.
  // An unknown value degrades to the honest "we have it" rather than to a raw
  // identifier on screen.
  return (
    <StatusState
      icon={<FiInbox />}
      title={t("governance:concernStatus.received.title")}
      body={t("governance:concernStatus.received.body")}
    >
      {dates}
    </StatusState>
  );
}

/**
 * The one message BOTH unresolvable answers get: a code that was never issued
 * and a code the query DTO refused outright. Saying which would make the page
 * an oracle for probing codes, and the rows behind these codes name people.
 */
export function ConcernCodeNotFoundState({
  onTryAgain,
}: {
  onTryAgain: () => void;
}) {
  const { t } = useTranslation();
  return (
    <StatusState
      icon={<FiSearch />}
      title={t("governance:concernStatus.notFound.title")}
      body={t("governance:concernStatus.notFound.body")}
    >
      <Button variant="ghost" size="sm" onClick={onTryAgain}>
        {t("governance:concernStatus.notFound.cta")}
      </Button>
    </StatusState>
  );
}

/** A network failure, which is not an answer about the concern at all. */
export function ConcernStatusUnavailableState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <StatusState
      icon={<FiWifiOff />}
      title={t("governance:concernStatus.unavailable.title")}
      body={t("governance:concernStatus.unavailable.body")}
    >
      <Button variant="ghost" size="sm" onClick={onRetry}>
        {t("governance:concernStatus.unavailable.cta")}
      </Button>
    </StatusState>
  );
}
