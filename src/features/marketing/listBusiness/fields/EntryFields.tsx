import { useState, type ReactNode } from "react";
import { FormField, RadioCardGroup } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  COVER_POLICY_CHOICE_LABEL_KEYS,
  ENTRY_MODE_LABEL_KEYS,
  hasCoverCategory,
} from "../listingFacts.data";
import { listingKindOf } from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import {
  COVER_CHOICES,
  coverChoiceOf,
  coverPolicyOf,
  ENTRY_CHOICES,
  entryChoiceOf,
  entryModeOf,
  factFieldsetIds,
  FREE_BEFORE_TIME_ERROR_KEY,
  isFreeBeforeTimeMissing,
  NOT_SAYING,
  NOT_SAYING_LABEL_KEY,
  type CoverChoice,
  type EntryChoice,
} from "./practicalFacts.data";
import pageStyles from "../ListBusinessPage.module.css";
import styles from "./PracticalFacts.module.css";

/**
 * One "Getting in and paying" question: a real fieldset whose legend names
 * the choices, the helper under them, then anything that follows from the
 * answer (the free-before time). The anchor sits on the fieldset, so a
 * "still needed" chip jumps here.
 */
export function FactFieldset({
  anchor,
  legend,
  helper,
  children,
  followUp,
}: {
  anchor: string;
  legend: string;
  helper?: string;
  /** The choices: a radio group or a chip row named by the legend. */
  children: ReactNode;
  /** Rendered under the helper. */
  followUp?: ReactNode;
}) {
  const { legendId, helperId } = factFieldsetIds(anchor);
  return (
    <fieldset
      id={anchor}
      className={[pageStyles.lbField, styles.fieldset].join(" ")}
      aria-describedby={helper ? helperId : undefined}
    >
      <legend id={legendId} className={styles.legend}>
        {legend}
      </legend>
      {children}
      {helper && (
        <p id={helperId} className={styles.helper}>
          {helper}
        </p>
      )}
      {followUp}
    </fieldset>
  );
}

/** "Free until": the time the save needs once "Free before a set time" is
 *  picked. The inline error shows after the field is left empty. */
function FreeBeforeTimeField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const [hasLeftField, setHasLeftField] = useState(false);
  const time = form.draft.coverFreeBefore ?? "";
  const isShowingError =
    hasLeftField && isFreeBeforeTimeMissing("freeBefore", time);
  return (
    <FormField
      className={styles.timeField}
      id={ANCHOR.coverFreeBefore}
      label={t("marketing:listBusiness.step3.cover.timeLabel")}
      required
      error={isShowingError ? t(FREE_BEFORE_TIME_ERROR_KEY) : undefined}
    >
      <input
        type="time"
        step={60}
        value={time}
        onChange={(event) => form.setCoverFreeBefore(event.target.value)}
        onBlur={() => setHasLeftField(true)}
      />
    </FormField>
  );
}

/** "Entry", asked of nightlife and culture: what it costs to come in. */
function CoverPolicyField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { legendId } = factFieldsetIds(ANCHOR.coverPolicy);
  const coverChoice = coverChoiceOf(form.draft.coverPolicy);
  const coverLabel = (choice: CoverChoice) =>
    choice === NOT_SAYING
      ? t(NOT_SAYING_LABEL_KEY)
      : t(COVER_POLICY_CHOICE_LABEL_KEYS[choice]);
  return (
    <FactFieldset
      anchor={ANCHOR.coverPolicy}
      legend={t("marketing:listBusiness.step3.cover.label")}
      helper={t("marketing:listBusiness.step3.cover.helper")}
      followUp={
        coverChoice === "freeBefore" && <FreeBeforeTimeField form={form} />
      }
    >
      <RadioCardGroup<CoverChoice>
        className={pageStyles.chipRow}
        optionClassName={pageStyles.chip}
        checkedClassName={pageStyles.chipOn}
        ariaLabel={t("marketing:listBusiness.step3.cover.label")}
        ariaLabelledBy={legendId}
        value={coverChoice}
        onChange={(choice) => form.setCoverPolicy(coverPolicyOf(choice))}
        options={COVER_CHOICES.map((choice) => ({
          id: choice,
          render: coverLabel(choice),
        }))}
      />
    </FactFieldset>
  );
}

/**
 * "How do people get in?" and, for nightlife and culture, "Entry". One
 * choice each, "Not saying" by default. On an out-and-about listing the way
 * in is linked to the hours toggle "By appointment only" (`setEntryMode`
 * runs `withEntryModeLinked`), a helper line under the choices says so, and
 * a walk-in reads "Just turn up". "Free
 * before a set time" asks for the time, which the save requires
 * (`factMissingFields`). The caller leaves it out for an online listing.
 */
export function EntryFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, setEntryMode } = form;
  const { legendId } = factFieldsetIds(ANCHOR.entryMode);
  const isMobile = listingKindOf(draft) === "mobile";
  const entryLabel = (choice: EntryChoice) => {
    if (choice === NOT_SAYING) return t(NOT_SAYING_LABEL_KEY);
    if (choice === "walkIn" && isMobile) {
      return t("marketing:listingFacts.entry.walkInMobile");
    }
    return t(ENTRY_MODE_LABEL_KEYS[choice]);
  };

  return (
    <>
      <FactFieldset
        anchor={ANCHOR.entryMode}
        legend={t("marketing:listBusiness.step3.entry.label")}
        helper={t("marketing:listBusiness.step3.entry.helper")}
        followUp={
          isMobile && (
            <p className={styles.helper}>
              {t("marketing:listBusiness.step3.entry.appointmentLinked")}
            </p>
          )
        }
      >
        <RadioCardGroup<EntryChoice>
          className={pageStyles.chipRow}
          optionClassName={pageStyles.chip}
          checkedClassName={pageStyles.chipOn}
          ariaLabel={t("marketing:listBusiness.step3.entry.label")}
          ariaLabelledBy={legendId}
          value={entryChoiceOf(draft.entryMode)}
          onChange={(choice) => setEntryMode(entryModeOf(choice))}
          options={ENTRY_CHOICES.map((choice) => ({
            id: choice,
            render: entryLabel(choice),
          }))}
        />
      </FactFieldset>
      {hasCoverCategory(draft.cats) && <CoverPolicyField form={form} />}
    </>
  );
}
