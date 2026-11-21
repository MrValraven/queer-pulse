import { FiCheck } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { slugify } from "./startCommunity.data";
import { useHandleTaken } from "./useHandleTaken";
import styles from "./StartCommunityPage.module.css";

/** The community's public address. The host comes from the page the founder is
 *  actually on, so a staging or preview deploy shows its own real link. */
export function ConfirmHandleField({
  value,
  error,
  onChange,
  isPrefixStacked = false,
}: {
  value: string;
  error: string | null;
  onChange: (handle: string) => void;
  /** Sets the address prefix on its own line above the input, so the whole
   *  handle stays visible on a narrow phone. The desktop chapter keeps one row. */
  isPrefixStacked?: boolean;
}) {
  const { t } = useTranslation();
  const isTaken = useHandleTaken(value);
  const shownError =
    error ?? (isTaken ? t("communities:start.confirm.handleTaken") : null);
  const prefix =
    typeof window === "undefined"
      ? "/community/"
      : `${window.location.host}/community/`;
  return (
    <div className={styles.handleBox}>
      <label htmlFor="sc-handle">
        {t("communities:start.confirm.handleLabel")}
      </label>
      <div
        className={[
          styles.handleWrap,
          isPrefixStacked && styles.handleWrapStacked,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={styles.handlePre}>{prefix}</span>
        <input
          id="sc-handle"
          className={styles.handleInput}
          value={value}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? "sc-handle-error" : undefined}
          onChange={(event) => onChange(slugify(event.target.value))}
        />
      </div>
      {shownError && (
        <p id="sc-handle-error" className={styles.handleError} role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
}

/** The "I understand what I'm opening" acknowledgement that gates the founding. */
export function ConfirmConsent({
  isConsented,
  onToggle,
}: {
  isConsented: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={[styles.consentCheck, isConsented && styles.consentOn]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={isConsented}
      onClick={onToggle}
    >
      <span className={styles.ccBox}>
        <FiCheck size={12} aria-hidden />
      </span>
      <span className={styles.ccTxt}>
        <Translation
          i18nKey="communities:start.confirm.consentText"
          components={{ strong: <b /> }}
        />
      </span>
    </button>
  );
}
