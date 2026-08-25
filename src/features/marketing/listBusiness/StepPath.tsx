import { FiHeart, FiHome, FiInfo } from "react-icons/fi";
import { RadioCardGroup } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR, type ListingPath } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

/* ===== Step 0 — You & the place ===== */
export function StepPath({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { t } = useTranslation();
  const { draft, pickPath } = form;
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step0.title")}
        em={t("marketing:listBusiness.step0.em")}
        sub={t("marketing:listBusiness.step0.sub")}
      />
      <RadioCardGroup<ListingPath>
        id={ANCHOR.path}
        className={styles.pathGrid}
        optionClassName={styles.pathCard}
        checkedClassName={styles.pathCardOn}
        ariaLabel={t("marketing:listBusiness.step0.pathAria")}
        value={draft.path}
        onChange={pickPath}
        options={[
          {
            id: "claim",
            render: (
              <>
                <span className={`${styles.pcIc} ${styles.pcIcOwn}`}>
                  <FiHome />
                </span>
                <b>{t("marketing:listBusiness.step0.claim.title")}</b>
                <span>{t("marketing:listBusiness.step0.claim.desc")}</span>
              </>
            ),
          },
          {
            id: "suggest",
            render: (
              <>
                <span className={`${styles.pcIc} ${styles.pcIcSug}`}>
                  <FiHeart />
                </span>
                <b>{t("marketing:listBusiness.step0.suggest.title")}</b>
                <span>{t("marketing:listBusiness.step0.suggest.desc")}</span>
              </>
            ),
          },
        ]}
      />

      <div className={styles.consent}>
        <FiInfo size={17} aria-hidden />
        <p>
          <Translation
            i18nKey="marketing:listBusiness.step0.signedInAs"
            components={{ b: <b /> }}
            values={{ name: userName }}
          />
        </p>
      </div>
    </div>
  );
}
