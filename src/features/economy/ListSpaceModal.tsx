import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import styles from "./ApplicationModals.module.css";

const SPACE_TYPES = [
  { value: "sublet", labelKey: "economy:listSpace.type.sublet" },
  { value: "room", labelKey: "economy:listSpace.type.room" },
  { value: "short", labelKey: "economy:listSpace.type.short" },
  { value: "studio", labelKey: "economy:listSpace.type.studio" },
];

export function ListSpaceModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [rent, setRent] = useState("");
  const [type, setType] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid =
    title.trim().length > 3 && area.trim().length > 1 && !!rent && !!type;

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:listSpace.success.title")}
          em={t("economy:listSpace.success.em")}
          onClose={onClose}
          closeLabel={t("economy:housingModal.done")}
        >
          <Translation
            i18nKey="economy:listSpace.success.body"
            values={{ title }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{t("economy:listSpace.eyebrow")}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:listSpace.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:listSpace.sub")}</p>

          <div className={styles.field}>
            <label htmlFor="ls-title">
              {t("economy:listSpace.titleLabel")}
            </label>
            <input
              id="ls-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("economy:listSpace.titlePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ls-area">{t("economy:listSpace.areaLabel")}</label>
            <input
              id="ls-area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={t("economy:listSpace.areaPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ls-rent">{t("economy:listSpace.rentLabel")}</label>
            <input
              id="ls-rent"
              type="number"
              min={0}
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder={t("economy:listSpace.rentPlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ls-type">{t("economy:listSpace.typeLabel")}</label>
            <select
              id="ls-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">{t("economy:listSpace.chooseOne")}</option>
              {SPACE_TYPES.map((spaceType) => (
                <option key={spaceType.value} value={spaceType.value}>
                  {t(spaceType.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <p className={styles.note}>{t("economy:listSpace.note")}</p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:housingModal.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
            >
              {sending ? (
                <Sending label={t("economy:listSpace.submitting")} />
              ) : (
                t("economy:listSpace.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
