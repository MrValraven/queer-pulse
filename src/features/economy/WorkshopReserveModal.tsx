import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useSubmitFlow } from "./modalFlow";
import type { Workshop } from "./workshops.data";
import styles from "./ApplicationModals.module.css";

export function WorkshopReserveModal({
  workshop,
  onClose,
}: {
  workshop: Workshop;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState(workshop.tiers[0]?.label ?? "");
  const [note, setNote] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const title = `${workshop.title} ${workshop.titleEm}`;
  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email) && !!tier;
  const chosen = workshop.tiers.find((tierOption) => tierOption.label === tier);

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:workshopReserve.ariaLabel", { title })}
    >
      {done ? (
        <SuccessPanel
          title={t("economy:workshopReserve.success.title")}
          em={t("economy:workshopReserve.success.em")}
          onClose={onClose}
          closeLabel={t("economy:workshopReserve.success.closeLabel")}
        >
          <Translation
            i18nKey="economy:workshopReserve.success.body"
            values={{
              title,
              firstName: name.split(" ")[0] ?? name,
              amount: chosen?.amount ?? "",
              date: workshop.startDate,
            }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{workshop.format}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:workshopReserve.title"
              values={{ title }}
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>
            {t("economy:workshopReserve.sub", {
              seatsLeft: workshop.spotsTotal - workshop.spotsFilled,
              seatsTotal: workshop.spotsTotal,
            })}
          </p>

          <div className={styles.field}>
            <label htmlFor="wr-name">
              {t("economy:workshopReserve.nameLabel")}
            </label>
            <input
              id="wr-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("economy:workshopReserve.namePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="wr-email">
              {t("economy:workshopReserve.emailLabel")}
            </label>
            <input
              id="wr-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("economy:workshopReserve.emailPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="wr-tier">
              {t("economy:workshopReserve.tierLabel")}
            </label>
            <select
              id="wr-tier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              {workshop.tiers.map((tierOption) => (
                <option key={tierOption.label} value={tierOption.label}>
                  {tierOption.label} — {tierOption.amount}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="wr-note">
              {t("economy:workshopReserve.noteLabel")}
            </label>
            <textarea
              id="wr-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("economy:workshopReserve.notePlaceholder")}
            />
          </div>
          <p className={styles.note}>
            {t("economy:workshopReserve.slidingNote")}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:workshopReserve.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
            >
              {sending ? (
                <Sending label={t("economy:workshopReserve.holdingLabel")} />
              ) : (
                t("economy:workshopReserve.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
