import {
  FiHeart,
  FiHome,
  FiInfo,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import { RadioCardGroup } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  VERIFY,
  type ListingPath,
  type VerifyOption,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

// Icon-component lookup for each verification option — stays colocated with
// the step because it references imported react-icons components (like a
// CSS-module class map, it depends on module imports, not mock data).
const VERIFY_ICON: Record<string, typeof FiMail> = {
  email: FiMail,
  instagram: FiInstagram,
  post: FiMapPin,
  later: FiMessageCircle,
};

/* ===== Step 0 — You & the place ===== */
export function StepPath({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { t } = useTranslation();
  const { draft, pickPath, set } = form;
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

      {draft.path === "claim" && (
        <div id={ANCHOR.verify} className={styles.revealBlock}>
          <label>{t("marketing:listBusiness.step0.verifyLabel")}</label>
          <p>{t("marketing:listBusiness.step0.verifyHelp")}</p>
          <RadioCardGroup
            className={styles.stack}
            optionClassName={styles.verifyOpt}
            checkedClassName={styles.optOn}
            ariaLabel={t("marketing:listBusiness.step0.verifyLabel")}
            value={draft.verify}
            onChange={(id) => set({ verify: id })}
            options={VERIFY.map((v: VerifyOption) => {
              const Icon = VERIFY_ICON[v.id] ?? FiMail;
              return {
                id: v.id,
                render: (
                  <>
                    <span className={styles.voIc}>
                      <Icon size={17} />
                    </span>
                    <span className={styles.radioTxt}>
                      <b>{t(v.labelKey)}</b>
                      <span>{t(v.descKey)}</span>
                    </span>
                    <span className={styles.voBadge}>{t(v.badgeKey)}</span>
                  </>
                ),
              };
            })}
          />
        </div>
      )}

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
