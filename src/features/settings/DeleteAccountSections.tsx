import { useId, type FormEvent } from "react";
import {
  FiAlertCircle,
  FiBell,
  FiClock,
  FiMinusCircle,
  FiTrash2,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { DELETE_CONTENT, type DeleteOption } from "./deleteAccount.data";
import type { DeletionRequest } from "./api/account.api";
import styles from "./DeleteAccountPage.module.css";

/** The per-option copy block driving the delete/deactivate confirmation UI. */
type DeleteContent = (typeof DELETE_CONTENT)[DeleteOption];

/** The two mutually-exclusive account-off-ramp cards (deactivate / delete). */
export function DeleteOptionCards({
  option,
  setOption,
}: {
  option: DeleteOption;
  setOption: (option: DeleteOption) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.optionGrid}>
      <div
        className={[
          styles.optCard,
          option === "deactivate" && styles.optCardSelected,
        ]
          .filter(Boolean)
          .join(" ")}
        role="button"
        tabIndex={0}
        aria-pressed={option === "deactivate"}
        onClick={() => setOption("deactivate")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOption("deactivate");
          }
        }}
      >
        <div className={styles.optRadio}>
          <div className={styles.optRadioInner} />
        </div>
        <div className={`${styles.optIcon} ${styles.optIconDefault}`}>
          {/* react-icons, never a hand-rolled glyph (DES-170). The stroke
              colour moved to `.optIconDefault .optIconSvg` in the module,
              since the pack paints from `currentColor`. */}
          <FiMinusCircle className={styles.optIconSvg} aria-hidden />
        </div>
        <div className={styles.optTitle}>
          {t("settings:deleteAccount.options.deactivate.title")}
        </div>
        <div className={styles.optDesc}>
          {t("settings:deleteAccount.options.deactivate.desc")}
        </div>
        <div className={`${styles.optTag} ${styles.optTagRev}`}>
          {t("settings:deleteAccount.options.deactivate.tag")}
        </div>
      </div>
      <div
        className={[
          styles.optCard,
          styles.optCardDanger,
          option === "delete" && styles.optCardSelected,
        ]
          .filter(Boolean)
          .join(" ")}
        role="button"
        tabIndex={0}
        aria-pressed={option === "delete"}
        onClick={() => setOption("delete")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOption("delete");
          }
        }}
      >
        <div className={styles.optRadio}>
          <div className={styles.optRadioInner} />
        </div>
        <div className={`${styles.optIcon} ${styles.optIconDanger}`}>
          <FiTrash2 className={styles.optIconSvg} aria-hidden />
        </div>
        <div className={`${styles.optTitle} ${styles.optTitleDanger}`}>
          {t("settings:deleteAccount.options.delete.title")}
        </div>
        <div className={styles.optDesc}>
          {t("settings:deleteAccount.options.delete.desc")}
        </div>
        <div className={`${styles.optTag} ${styles.optTagPerm}`}>
          {t("settings:deleteAccount.options.delete.tag")}
        </div>
      </div>
    </div>
  );
}

/**
 * Shown in place of the delete form when a deletion request is already pending
 * (from `GET /account/deletion-request`). Honest, cancellable during grace.
 */
export function DeletePendingBanner({
  request,
  onCancel,
  cancelling,
}: {
  request: DeletionRequest;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const when = fmt.date(new Date(request.scheduledErasureAt), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className={styles.pauseStrip}>
      <FiAlertCircle className={styles.pauseStripIcon} aria-hidden="true" />
      <div>
        <p className={styles.pauseStripText}>
          <Translation
            i18nKey="settings:deleteAccount.pending.banner"
            components={{ strong: <strong /> }}
            values={{ date: when }}
          />
        </p>
        <Button
          variant="primary"
          onClick={onCancel}
          disabled={cancelling}
          className={styles.stripAction}
        >
          {cancelling
            ? t("settings:deleteAccount.pending.cancelling")
            : t("settings:deleteAccount.pending.cancelBtn")}
        </Button>
      </div>
    </div>
  );
}

/** The typed-phrase confirmation box plus submit / cancel actions. */
export function DeleteConfirmForm({
  content,
  phrase,
  setPhrase,
  confirmPhrase,
  canSubmit,
  onSubmit,
}: {
  content: DeleteContent;
  phrase: string;
  setPhrase: (value: string) => void;
  confirmPhrase: string | null;
  canSubmit: boolean;
  onSubmit: (event: FormEvent) => void;
}) {
  const { t } = useTranslation();
  const confirmLabelId = useId();
  return (
    <form className={styles.confirmForm} onSubmit={onSubmit}>
      {content.phraseKey && (
        <div>
          <div className={styles.cfLabel} id={confirmLabelId}>
            <Translation
              i18nKey="settings:deleteAccount.confirm.typeLabel"
              components={{
                strong: <strong className={styles.confirmPhrase} />,
              }}
              values={{ phrase: confirmPhrase ?? "" }}
            />
          </div>
          <input
            aria-labelledby={confirmLabelId}
            className={[
              styles.cfInput,
              content.isDanger && styles.cfInputDanger,
            ]
              .filter(Boolean)
              .join(" ")}
            type="text"
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
          />
          <div className={styles.cfHint}>{t(content.confirmHintKey)}</div>
        </div>
      )}
      <div className={styles.formActions}>
        <Button
          type="submit"
          variant="primary"
          disabled={!canSubmit}
          className={content.isDanger ? styles.btnDanger : undefined}
        >
          {t(content.btnLabelKey)}
        </Button>
        <Button variant="ghost" to={routes.settings}>
          {t("settings:deleteAccount.confirm.cancelBtn")}
        </Button>
      </div>
    </form>
  );
}

/**
 * The gentler alternative offered beside deactivation: a way into the
 * Notifications pane.
 *
 * This was a decorative button offering a 30-day bulk pause of "all emails and
 * digests". Nothing backed either half. No endpoint silences everything
 * (preferences are per-category through `putNotificationPreference`, plus a
 * quiet-hours window through `putNotificationDelivery`), and QueerPulse
 * delivers no email at all. In front of someone weighing up deletion is the
 * worst possible place for a promise the platform cannot keep, so the strip
 * points at the controls that genuinely exist.
 *
 * `onOpenNotificationSettings` arrives when this renders as a pane INSIDE
 * SettingsPage. That page reads `?pane=` once, in a `useState` initializer, so
 * a link to `?pane=notifications` from within it would change the URL and
 * leave the pane where it was; switching panes in place is the working move.
 * The standalone `/account/delete` page passes no callback, and a real link
 * navigates there, mounting SettingsPage fresh on the right pane.
 */
export function PauseNotificationsStrip({
  onOpenNotificationSettings,
}: {
  onOpenNotificationSettings?: () => void;
}) {
  const { t } = useTranslation();
  const label = (
    <>
      <FiBell aria-hidden="true" /> {t("settings:deleteAccount.pauseStrip.cta")}
    </>
  );
  return (
    <div className={styles.pauseStrip}>
      <FiClock className={styles.pauseStripIcon} aria-hidden="true" />
      <div>
        <p className={styles.pauseStripText}>
          <Translation
            i18nKey="settings:deleteAccount.pauseStrip.text"
            components={{ strong: <strong /> }}
          />
        </p>
        {onOpenNotificationSettings ? (
          <Button
            variant="ghost"
            onClick={onOpenNotificationSettings}
            className={styles.stripAction}
          >
            {label}
          </Button>
        ) : (
          <Button
            variant="ghost"
            to={`${routes.settings}?pane=notifications`}
            className={styles.stripAction}
          >
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}
