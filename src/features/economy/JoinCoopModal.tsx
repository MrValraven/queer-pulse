import { useState } from "react";
import { Button, Select } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSubmitCoopJoinRequest } from "./api/useSubmitCoopJoinRequest";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import type { FormingCoop } from "./housingCoop.data";
import styles from "./ApplicationModals.module.css";

/** i18n Pattern A — labelKey resolved via t() below. */
const HOUSEHOLD_SIZES: { value: string; labelKey: string }[] = [
  { value: "Just me", labelKey: "economy:joinCoop.household.justMe" },
  {
    value: "Me + partner(s)",
    labelKey: "economy:joinCoop.household.mePlusPartners",
  },
  { value: "A household of 3–4", labelKey: "economy:joinCoop.household.small" },
  { value: "A household of 5+", labelKey: "economy:joinCoop.household.large" },
];

export function JoinCoopModal({
  coop,
  onClose,
}: {
  coop: FormingCoop;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [household, setHousehold] = useState("");
  const [note, setNote] = useState("");
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const joinRequest = useSubmitCoopJoinRequest();
  const coopName = `${coop.name}${coop.nameEm ? ` ${coop.nameEm}` : ""}`;
  const valid = name.trim().length > 1 && !!household;
  const done = joinRequest.isSuccess;

  const handleSubmit = () => {
    if (!valid) return;
    joinRequest.mutate(
      {
        slug: coop.id,
        name: name.trim(),
        householdSize: household,
        note: note.trim() || undefined,
      },
      {
        onError: (error) => {
          if (handlePledgeError(error, handleSubmit)) return;
          showToast(t("economy:joinCoop.error"), "error");
        },
      },
    );
  };

  if (pledgeGate) return pledgeGate;

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:joinCoop.askToJoinAriaLabel", { name: coopName })}
    >
      {done ? (
        <SuccessPanel
          title={t("economy:joinCoop.success.title")}
          em={t("economy:joinCoop.success.em")}
          onClose={onClose}
          closeLabel={t("economy:joinCoop.success.closeLabel")}
          // PRD-242. Says where the answer will show up. Without it the panel
          // was the last thing anyone ever heard about the application.
          footer={
            <p className={styles.successNote}>
              {t("economy:joinCoop.success.whereToCheck")}
            </p>
          }
        >
          <Translation
            i18nKey="economy:joinCoop.success.body"
            components={{ strong: <strong /> }}
            values={{ name: coopName }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{coop.phaseLabel}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:joinCoop.title"
              components={{ em: <em /> }}
              values={{ name: coopName }}
            />
          </h2>
          <p className={styles.sub}>
            {t("economy:joinCoop.sub", { location: coop.location })}
          </p>

          <div className={styles.field}>
            <label htmlFor="jc-name">{t("economy:joinCoop.nameLabel")}</label>
            <input
              id="jc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("economy:joinCoop.namePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="jc-household">
              {t("economy:joinCoop.householdLabel")}
            </label>
            <Select
              id="jc-household"
              placeholder={t("economy:joinCoop.chooseOne")}
              value={household || null}
              onChange={(value) => setHousehold(value ?? "")}
              options={HOUSEHOLD_SIZES.map((householdSize) => ({
                value: householdSize.value,
                label: t(householdSize.labelKey),
              }))}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="jc-note">{t("economy:joinCoop.noteLabel")}</label>
            <textarea
              id="jc-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("economy:joinCoop.notePlaceholder")}
            />
          </div>
          <p className={styles.note}>{t("economy:joinCoop.disclaimer")}</p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:joinCoop.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || joinRequest.isPending}
              onClick={handleSubmit}
            >
              {joinRequest.isPending ? (
                <Sending label={t("economy:joinCoop.sending")} />
              ) : (
                t("economy:joinCoop.sendCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
