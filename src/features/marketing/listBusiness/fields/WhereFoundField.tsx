import { FiGlobe, FiMapPin } from "react-icons/fi";
import {
  FormField,
  RadioCardGroup,
  type RadioCardOption,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import { whereFoundChoiceOf, type WhereFoundChoice } from "../listingKind";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

const KEY = "marketing:listBusiness.step0.whereFound";

/**
 * Step 0's second question: a place people visit, or online only. Required
 * before Next, for staff drafts too (staff record online businesses as well).
 * The answer picks the category list in Basics and the practical step's
 * fields. Switching later keeps the other kind's answers in the draft
 * (`withListingKind`). An edit never shows this step; its Basics carry the
 * online toggle at the top.
 */
export function WhereFoundField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, chooseWhereFound } = form;
  const options: RadioCardOption<WhereFoundChoice>[] = [
    {
      id: "place",
      render: (
        <>
          <span className={`${styles.pcIc} ${styles.pcIcOwn}`}>
            <FiMapPin />
          </span>
          <b>{t(`${KEY}.place.title`)}</b>
          <span>{t(`${KEY}.place.desc`)}</span>
        </>
      ),
    },
    {
      id: "online",
      render: (
        <>
          <span className={`${styles.pcIc} ${styles.pcIcSug}`}>
            <FiGlobe />
          </span>
          <b>{t(`${KEY}.online.title`)}</b>
          <span>{t(`${KEY}.online.desc`)}</span>
        </>
      ),
    },
  ];
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.whereFound}
      label={t(`${KEY}.label`)}
      required
      helper={t(`${KEY}.helper`)}
    >
      <RadioCardGroup<WhereFoundChoice>
        className={styles.pathGrid}
        optionClassName={styles.pathCard}
        checkedClassName={styles.pathCardOn}
        ariaLabel={t(`${KEY}.aria`)}
        value={whereFoundChoiceOf(draft)}
        onChange={chooseWhereFound}
        options={options}
      />
    </FormField>
  );
}
