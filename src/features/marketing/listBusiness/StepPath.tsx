import { FiHeart, FiHome, FiInfo } from "react-icons/fi";
import {
  RadioCardGroup,
  type RadioCardOption,
} from "../../../shared/components/ui";
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

  const claimOption: RadioCardOption<ListingPath> = {
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
  };
  const suggestOption: RadioCardOption<ListingPath> = {
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
  };
  /* Claiming says "this is my business". A staff-authored entry is written
     for a business that has not joined yet, so that is never true of it: the
     admin is recording that the place exists. Withholding the option keeps
     the state unreachable, and with it the whole claim-only bar (the owner's
     role, opening hours, a cover photo with alt text) that an admin has no
     standing to answer for somebody else. The server agrees: its path
     requirements only bite on a claim, and an admin-authored listing is
     never one. */
  const pathOptions = draft.isStaffAuthored
    ? [suggestOption]
    : [claimOption, suggestOption];

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
        options={pathOptions}
      />

      {/* "Signed in as {name}" tells the member which account the listing
          will hang off. A staff-authored draft belongs to the business it
          names, and its `userName` is empty, so the line would print an
          empty bold about an account that owns nothing here. */}
      {!draft.isStaffAuthored && (
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
      )}
    </div>
  );
}
