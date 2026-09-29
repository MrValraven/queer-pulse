import { useId, useState, type FormEvent } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  AMBASSADOR_FOCUS_AREAS,
  AMBASSADOR_FOCUS_LABEL_KEY,
  isAmbassadorFocusArea,
  type AmbassadorFocusArea,
} from "../../../shared/ambassadors/ambassadorFocusAreas.data";
import { type StrangerMemberResult } from "../../messages/api/useStrangerMemberSearch";
import {
  AMBASSADOR_REASON_MAX_LENGTH,
  AMBASSADOR_REASON_MIN_LENGTH,
  ambassadorErrorKey,
  isAmbassadorReasonValid,
} from "./adminAmbassadors.api";
import { useGrantAmbassador } from "./useAdminAmbassadors";
import { AdminAmbassadorMemberField } from "./AdminAmbassadorMemberField";
import styles from "./AdminAmbassadorsPage.module.css";

/** The grant form: who, which focus area, and why. Every field is required;
 *  the reason is logged with the grant. */
export function AdminAmbassadorGrantPanel() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const grant = useGrantAmbassador();
  const [picked, setPicked] = useState<StrangerMemberResult | null>(null);
  const [focusArea, setFocusArea] = useState<AmbassadorFocusArea | "">("");
  const [reason, setReason] = useState("");
  const isReasonValid = isAmbassadorReasonValid(reason);
  const isReady = Boolean(picked && focusArea && isReasonValid);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!picked || !focusArea || !isReasonValid) return;
    grant.mutate(
      { member: picked, focusArea, reason: reason.trim() },
      {
        onSuccess: () => {
          setPicked(null);
          setFocusArea("");
          setReason("");
          showToast(
            t("admin:ambassadors.grant.success", { name: picked.name }),
            "success",
          );
        },
      },
    );
  }

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.panelTitle}>
        {t("admin:ambassadors.grant.title")}
      </h2>
      <p className={styles.panelHint}>{t("admin:ambassadors.grant.hint")}</p>
      <form className={styles.grantForm} onSubmit={handleSubmit}>
        <AdminAmbassadorMemberField
          picked={picked}
          onPick={(member) => {
            grant.reset();
            setPicked(member);
          }}
        />
        <FormField label={t("admin:ambassadors.grant.focusLabel")} required>
          <select
            value={focusArea}
            onChange={(event) => {
              const nextFocus = event.target.value;
              setFocusArea(isAmbassadorFocusArea(nextFocus) ? nextFocus : "");
            }}
          >
            <option value="">
              {t("admin:ambassadors.grant.focusPlaceholder")}
            </option>
            {AMBASSADOR_FOCUS_AREAS.map((area) => (
              <option key={area} value={area}>
                {t(AMBASSADOR_FOCUS_LABEL_KEY[area])}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label={t("admin:ambassadors.grant.reasonLabel")}
          required
          helper={t("admin:ambassadors.grant.reasonHint", {
            min: AMBASSADOR_REASON_MIN_LENGTH,
          })}
          labelAside={`${reason.length}/${AMBASSADOR_REASON_MAX_LENGTH}`}
        >
          <textarea
            value={reason}
            maxLength={AMBASSADOR_REASON_MAX_LENGTH}
            rows={3}
            onChange={(event) => setReason(event.target.value)}
          />
        </FormField>
        {grant.isError && (
          <p className={styles.formError} role="alert">
            <FiAlertCircle aria-hidden />
            {t(ambassadorErrorKey(grant.error))}
          </p>
        )}
        <Button type="submit" disabled={!isReady || grant.isPending}>
          {grant.isPending
            ? t("admin:ambassadors.grant.pending")
            : t("admin:ambassadors.grant.submit")}
        </Button>
      </form>
    </section>
  );
}
