import { useEffect } from "react";
import { FiCheck, FiGift } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ACCESS_OPTIONS,
  FEATURE_OPTIONS,
  slugify,
  typeLabelFor,
} from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import { useHandleTaken } from "./useHandleTaken";
import styles from "./StartCommunityPage.module.css";

function Recap({
  title,
  step,
  onEdit,
  rows,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  rows: { k: string; v: React.ReactNode; missing?: boolean }[];
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.recapGroup}>
      <div className={styles.recapH}>
        {title}
        <Button
          variant="ghost"
          size="sm"
          className={styles.recapEdit}
          onClick={() => onEdit(step)}
        >
          {t("communities:start.confirm.editCta")}
        </Button>
      </div>
      {rows.map((r) => (
        <div key={r.k} className={styles.recapRow}>
          <span className={styles.rk}>{r.k}</span>
          <span className={`${styles.rv} ${r.missing ? styles.rvMiss : ""}`}>
            {r.v}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Chapter 8 — Confirm: handle, recap, and the consent to open. */
export function StepConfirm({
  form,
  onEdit,
  handleError = null,
  onHandleChange,
}: {
  form: CommunityForm;
  onEdit: (step: number) => void;
  /** Set when the server refused the handle as taken (a 409 on create), so the
   *  founder sees which field to change instead of a generic failure toast. */
  handleError?: string | null;
  /** Clears that error the moment they start editing the handle. */
  onHandleChange?: () => void;
}) {
  const { t } = useTranslation();
  const { draft, set } = form;

  // Pre-fill the handle from the name the first time they reach this step.
  useEffect(() => {
    if (!draft.handle.trim() && draft.name.trim()) {
      set({ handle: slugify(draft.name) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const access = ACCESS_OPTIONS.find((a) => a.tier === draft.accessTier);
  const featureLabels = FEATURE_OPTIONS.filter((f) =>
    draft.features.includes(f.id),
  ).map((f) => t(f.labelKey));
  const invitedCount = draft.invites.length;
  const notSetYet = t("communities:start.confirm.notSetYet");

  return (
    <div>
      <p className={styles.confirmLead}>
        {t("communities:start.confirm.lead")}
      </p>

      <ConfirmHandleField
        value={draft.handle}
        error={handleError}
        onChange={(handle) => {
          onHandleChange?.();
          set({ handle });
        }}
      />

      <Recap
        title={t("communities:start.confirm.recap.why")}
        step={1}
        onEdit={onEdit}
        rows={[
          {
            k: t("communities:start.confirm.recap.name"),
            v: draft.name || notSetYet,
            missing: !draft.name,
          },
          {
            k: t("communities:start.confirm.recap.for"),
            v: draft.purpose || notSetYet,
            missing: !draft.purpose,
          },
          {
            k: t("communities:start.confirm.recap.kind"),
            v: typeLabelFor(draft.type),
          },
        ]}
      />
      <Recap
        title={t("communities:start.confirm.recap.who")}
        step={2}
        onEdit={onEdit}
        rows={[
          {
            k: t("communities:start.confirm.recap.gathering"),
            v: draft.whoFor || notSetYet,
            missing: !draft.whoFor,
          },
        ]}
      />
      <Recap
        title={t("communities:start.confirm.recap.safety")}
        step={3}
        onEdit={onEdit}
        rows={[
          {
            k: t("communities:start.confirm.recap.access"),
            v: access
              ? t(access.nameKey)
              : t("communities:start.confirm.notChosenYet"),
            missing: !access,
          },
          {
            k: t("communities:start.confirm.recap.roster"),
            v: draft.rosterVisible
              ? t("communities:start.confirm.rosterVisible")
              : t("communities:start.confirm.rosterHidden"),
          },
        ]}
      />
      <Recap
        title={t("communities:start.confirm.recap.running")}
        step={4}
        onEdit={onEdit}
        rows={[
          {
            k: t("communities:start.confirm.recap.stewards"),
            v: t("communities:start.confirm.stewardsValue", {
              count: draft.stewards.length,
              co: draft.stewards.length - 1,
            }),
          },
          {
            k: t("communities:start.confirm.recap.inside"),
            v: featureLabels.join(", "),
          },
        ]}
      />
      <Recap
        title={t("communities:start.confirm.recap.toneFeeling")}
        step={5}
        onEdit={onEdit}
        rows={[
          {
            k: t("communities:start.confirm.recap.sharedValues"),
            v: t("communities:start.confirm.sharedValuesCount", {
              count: draft.rules.length,
            }),
          },
          {
            k: t("communities:start.confirm.recap.tagline"),
            v: draft.tagline || notSetYet,
            missing: !draft.tagline,
          },
        ]}
      />
      {invitedCount > 0 && (
        <Recap
          title={t("communities:start.confirm.recap.firstPeople")}
          step={7}
          onEdit={onEdit}
          rows={[
            {
              k: t("communities:start.confirm.recap.inviting"),
              v: t("communities:start.confirm.invitingCount", {
                count: invitedCount,
              }),
            },
          ]}
        />
      )}

      <div className={styles.costNote}>
        <FiGift size={18} aria-hidden />
        <p>
          <Translation
            i18nKey="communities:start.confirm.costNote"
            components={{ strong: <b /> }}
          />
        </p>
      </div>

      <ConfirmConsent
        isConsented={draft.consent}
        onToggle={() => set({ consent: !draft.consent })}
      />
    </div>
  );
}

/** The community's public address. The host comes from the page the founder is
 *  actually on, so a staging or preview deploy shows the real link rather than
 *  a hardcoded production domain. */
function ConfirmHandleField({
  value,
  error,
  onChange,
}: {
  value: string;
  error: string | null;
  onChange: (handle: string) => void;
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
      <div className={styles.handleWrap}>
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
function ConfirmConsent({
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
