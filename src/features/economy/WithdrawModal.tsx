import { useState } from "react";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";
import { Button, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useSubmitFlow } from "./modalFlow";
import type { Application } from "./applicationStatus.types";
import { withdrawnPatch } from "./applicationStatus.patches";
import { WITHDRAW_REASONS } from "./applicationModals.data";
import styles from "./ApplicationModals.module.css";

/** Confirm withdrawing an application — changes card state. */
export function WithdrawModal({
  app,
  onClose,
  onPatch,
}: {
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const { t } = useTranslation();
  const { submit, sending, done } = useSubmitFlow();
  const [reason, setReason] = useState<string | null>(null);

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:withdraw.success.title")}
          em={t("economy:withdraw.success.em")}
          onClose={onClose}
        >
          {t("economy:withdraw.success.body", { company: app.companyName })}
        </SuccessPanel>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(() => onPatch(app.id, withdrawnPatch()));
          }}
        >
          <div className={styles.eyebrow}>{t("economy:withdraw.eyebrow")}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:withdraw.title"
              values={{ company: app.companyName }}
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>
            <Translation
              i18nKey="economy:withdraw.sub"
              values={{ title: app.title }}
              components={{ b: <b /> }}
            />
          </p>
          <div className={styles.field}>
            <label htmlFor="wd-reason">
              {t("economy:withdraw.reasonLabel")}
            </label>
            <Select
              id="wd-reason"
              placeholder={t("economy:withdraw.reasonPlaceholder")}
              value={reason}
              onChange={setReason}
              options={WITHDRAW_REASONS.map((withdrawReason) => ({
                value: withdrawReason.value,
                label: t(withdrawReason.labelKey),
              }))}
            />
          </div>
          <div className={styles.note}>
            <FiAlertTriangle
              size={13}
              style={{ marginRight: 5, verticalAlign: "-2px" }}
              aria-hidden
            />
            {t("economy:withdraw.cantUndo")}
          </div>
          <div className={styles.foot}>
            <button
              type="button"
              className={styles.back}
              onClick={onClose}
              disabled={sending}
            >
              <FiArrowLeft aria-hidden />{" "}
              {t("economy:withdraw.keepIt")}
            </button>
            <Button size="lg" type="submit" disabled={sending}>
              {sending ? (
                <Sending label={t("economy:withdraw.sendingLabel")} />
              ) : (
                t("economy:withdraw.submitCta")
              )}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
