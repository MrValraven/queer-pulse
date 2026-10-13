import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Collapse, useRefineGlide } from "../../shared/components/ui";
import { useRovingRadioGroup, type RovingRadioProps } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isListingFactChipDisabled,
  type DirectoryListingFactFilters,
  type ListingFactCounts,
  type ListingFactFilterChange,
} from "./directoryListingFactFilters";
import { useListingAttributeVocabulary } from "./listBusiness/api/useListingAttributeVocabulary";
import {
  COMMON_LISTING_LANGUAGE_CODES,
  ENTRY_MODE_LABEL_KEYS,
  INCLUSION_PRACTICE_LABEL_KEYS,
  languageLabel,
  LISTING_ENTRY_MODES,
  LISTING_INCLUSION_PRACTICES,
  LISTING_LANGUAGE_CODES,
  LISTING_PAYMENT_METHODS,
  offeredInclusionPractices,
  PAYMENT_METHOD_LABEL_KEYS,
  type ListingLanguageCode,
} from "./listBusiness/listingFacts.data";
import s from "./LocalFilterBar.module.css";

/** Space and Enter on a radio chip are left to the button's own click, so
 *  pressing the checked chip clears it the same way a click does. */
function isActivationKey(key: string): boolean {
  return key === " " || key === "Enter";
}

/** One fact chip in the Access pattern: pressed state, a popped-in tick,
 *  and unpickable only when it can only narrow and nothing would remain. */
export function LocalFactChip({
  label,
  isOn,
  change,
  count,
  listingFacts,
  isLoadedSetComplete,
  onToggle,
  radio,
}: {
  label: string;
  isOn: boolean;
  change: ListingFactFilterChange;
  /** How many loaded places would remain with this chip pressed. */
  count: number;
  listingFacts: DirectoryListingFactFilters;
  /** True once every page of places has loaded, so a zero count is final. */
  isLoadedSetComplete: boolean;
  onToggle: (change: ListingFactFilterChange) => void;
  /** Given in a single-choice group: the chip becomes a `role="radio"` with
   *  the group's roving tab stop and arrow keys. */
  radio?: RovingRadioProps<HTMLButtonElement>;
}) {
  // Inside the Refine drawer a ticked chip pops its tick in and its
  // neighbours glide aside; in the mobile sheet the chips stay still.
  const glide = useRefineGlide();
  const stateProps = radio
    ? {
        role: "radio",
        "aria-checked": isOn,
        ref: radio.ref,
        tabIndex: radio.tabIndex,
        onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
          if (!isActivationKey(event.key)) radio.onKeyDown(event);
        },
      }
    : { "aria-pressed": isOn };
  return (
    <m.button
      {...glide.chip}
      {...stateProps}
      type="button"
      disabled={isListingFactChipDisabled({
        filters: listingFacts,
        change,
        count,
        isLoadedSetComplete,
      })}
      className={[s.chip, isOn && s.chipOn].filter(Boolean).join(" ")}
      onClick={() => onToggle(change)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {isOn && (
          <m.span key="tick" className={s.tick} {...glide.tick}>
            <FiCheck aria-hidden />
          </m.span>
        )}
      </AnimatePresence>
      {label}
    </m.button>
  );
}

/** A named band of fact chips: a real fieldset, so the set is announced as
 *  one group, with its note saying how several picks combine. */
function FactGroup({
  label,
  note,
  children,
  extra,
  footer,
  isSingleChoice = false,
}: {
  label: string;
  note: string;
  children: ReactNode;
  /** More chips under the row, such as the languages behind a disclosure. */
  extra?: ReactNode;
  /** A control under the chips, such as "Show more languages". */
  footer?: ReactNode;
  /** One chip at most: the fieldset is announced as a radio group. */
  isSingleChoice?: boolean;
}) {
  const glide = useRefineGlide();
  const legendId = useId();
  return (
    <fieldset
      className={s.accessGroup}
      role={isSingleChoice ? "radiogroup" : undefined}
      aria-labelledby={isSingleChoice ? legendId : undefined}
    >
      <legend id={legendId} className={s.groupLabel}>
        {label}
      </legend>
      <p className={s.accessNote}>{note}</p>
      <m.div {...glide.row} className={s.accessChips}>
        {children}
      </m.div>
      {extra}
      {footer}
    </fieldset>
  );
}

/** A disabled radio chip: out of the tab order, with no keys of its own. */
const UNPICKABLE_RADIO: RovingRadioProps<HTMLButtonElement> = {
  ref: () => {},
  tabIndex: -1,
  onKeyDown: () => {},
};

/**
 * "How to get in": one way at most, so the chips are a radio group. The
 * arrow keys move the choice across the pickable chips (a chip that would
 * empty the list is skipped), and pressing the checked chip clears it.
 */
function EntryModeFactGroup({
  listingFacts,
  onToggleListingFact,
  counts,
  isLoadedSetComplete,
}: {
  listingFacts: DirectoryListingFactFilters;
  onToggleListingFact: (change: ListingFactFilterChange) => void;
  counts: ListingFactCounts;
  isLoadedSetComplete: boolean;
}) {
  const { t } = useTranslation();
  const pickableModes = LISTING_ENTRY_MODES.filter(
    (mode) =>
      !isListingFactChipDisabled({
        filters: listingFacts,
        change: { kind: "entryMode", mode },
        count: counts.entryModes[mode],
        isLoadedSetComplete,
      }),
  );
  const roving = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: pickableModes.length,
    checkedIndex: pickableModes.findIndex(
      (mode) => mode === listingFacts.entryMode,
    ),
    onSelect: (index) => {
      const mode = pickableModes[index];
      if (mode && mode !== listingFacts.entryMode) {
        onToggleListingFact({ kind: "entryMode", mode });
      }
    },
  });

  return (
    <FactGroup
      label={t("marketing:local.filter.entryLabel")}
      note={t("marketing:local.filter.entryNote")}
      isSingleChoice
    >
      {LISTING_ENTRY_MODES.map((mode) => {
        const pickableIndex = pickableModes.indexOf(mode);
        return (
          <LocalFactChip
            key={mode}
            listingFacts={listingFacts}
            isLoadedSetComplete={isLoadedSetComplete}
            onToggle={onToggleListingFact}
            label={t(ENTRY_MODE_LABEL_KEYS[mode])}
            isOn={listingFacts.entryMode === mode}
            change={{ kind: "entryMode", mode }}
            count={counts.entryModes[mode]}
            radio={
              pickableIndex >= 0
                ? roving.getRadioProps(pickableIndex)
                : UNPICKABLE_RADIO
            }
          />
        );
      })}
    </FactGroup>
  );
}

/**
 * "Languages": the common five and any picked one, with the rest behind
 * "Show more languages". While the rest are shown, every uncommon language
 * sits in that second row, so pressing a chip never moves it.
 */
function LanguageFactGroup({
  listingFacts,
  onToggleListingFact,
  counts,
  isLoadedSetComplete,
}: {
  listingFacts: DirectoryListingFactFilters;
  onToggleListingFact: (change: ListingFactFilterChange) => void;
  counts: ListingFactCounts;
  isLoadedSetComplete: boolean;
}) {
  const { t } = useTranslation();
  const glide = useRefineGlide();
  const moreLanguagesId = useId();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const isCommon = (code: ListingLanguageCode) =>
    COMMON_LISTING_LANGUAGE_CODES.includes(code);
  const firstRow = LISTING_LANGUAGE_CODES.filter(
    (code) =>
      isCommon(code) ||
      (!isShowingAll && listingFacts.languages.includes(code)),
  );
  const moreRow = LISTING_LANGUAGE_CODES.filter((code) => !isCommon(code));
  const chip = (code: ListingLanguageCode) => (
    <LocalFactChip
      key={code}
      listingFacts={listingFacts}
      isLoadedSetComplete={isLoadedSetComplete}
      onToggle={onToggleListingFact}
      label={languageLabel(t, code)}
      isOn={listingFacts.languages.includes(code)}
      change={{ kind: "language", code }}
      count={counts.languages[code]}
    />
  );

  return (
    <FactGroup
      label={t("marketing:local.filter.langLabel")}
      note={t("marketing:local.filter.langNote")}
      footer={
        <button
          type="button"
          className={s.moreFiltersToggle}
          aria-expanded={isShowingAll}
          aria-controls={isShowingAll ? moreLanguagesId : undefined}
          onClick={() => setIsShowingAll((wasShowingAll) => !wasShowingAll)}
        >
          {isShowingAll ? (
            <FiChevronUp aria-hidden />
          ) : (
            <FiChevronDown aria-hidden />
          )}
          {t(
            isShowingAll
              ? "marketing:local.filter.languages.showFewer"
              : "marketing:local.filter.languages.showMore",
          )}
        </button>
      }
      extra={
        <Collapse isOpen={isShowingAll}>
          <m.div
            {...glide.row}
            id={moreLanguagesId}
            className={`${s.accessChips} ${s.moreLanguages}`}
          >
            {moreRow.map(chip)}
          </m.div>
        </Collapse>
      }
    >
      {firstRow.map(chip)}
    </FactGroup>
  );
}

/**
 * "How to get in", "Ways to pay", "Languages" and "Inclusion practices",
 * beside "Who runs it" and the access needs. The Online tab leaves the first
 * two out (an online listing has neither) and offers the practices an online
 * listing can follow, plus any chosen one, so a stale link can be undone
 * here.
 */
export function LocalListingFactFilters({
  listingFacts,
  onToggleListingFact,
  counts,
  isLoadedSetComplete,
  isOnlineScope,
}: {
  listingFacts: DirectoryListingFactFilters;
  onToggleListingFact: (change: ListingFactFilterChange) => void;
  counts: ListingFactCounts;
  isLoadedSetComplete: boolean;
  isOnlineScope: boolean;
}) {
  const { t } = useTranslation();
  const vocabulary = useListingAttributeVocabulary();
  const shared = {
    listingFacts,
    isLoadedSetComplete,
    onToggle: onToggleListingFact,
  };
  const offeredPractices: readonly string[] = isOnlineScope
    ? offeredInclusionPractices("online", [], vocabulary.inclusionPractices)
    : LISTING_INCLUSION_PRACTICES;
  const practices = LISTING_INCLUSION_PRACTICES.filter(
    (practice) =>
      offeredPractices.includes(practice) ||
      listingFacts.practices.includes(practice),
  );

  return (
    <>
      {!isOnlineScope && (
        <EntryModeFactGroup
          listingFacts={listingFacts}
          onToggleListingFact={onToggleListingFact}
          counts={counts}
          isLoadedSetComplete={isLoadedSetComplete}
        />
      )}
      {!isOnlineScope && (
        <FactGroup
          label={t("marketing:local.filter.payLabel")}
          note={t("marketing:local.filter.payNote")}
        >
          {LISTING_PAYMENT_METHODS.map((method) => (
            <LocalFactChip
              key={method}
              {...shared}
              label={t(PAYMENT_METHOD_LABEL_KEYS[method])}
              isOn={listingFacts.payments.includes(method)}
              change={{ kind: "payment", method }}
              count={counts.payments[method]}
            />
          ))}
        </FactGroup>
      )}
      <LanguageFactGroup
        listingFacts={listingFacts}
        onToggleListingFact={onToggleListingFact}
        counts={counts}
        isLoadedSetComplete={isLoadedSetComplete}
      />
      <FactGroup
        label={t("marketing:local.filter.practiceLabel")}
        note={t("marketing:local.filter.practiceNote")}
      >
        {practices.map((practice) => (
          <LocalFactChip
            key={practice}
            {...shared}
            label={t(INCLUSION_PRACTICE_LABEL_KEYS[practice])}
            isOn={listingFacts.practices.includes(practice)}
            change={{ kind: "practice", practice }}
            count={counts.practices[practice]}
          />
        ))}
      </FactGroup>
    </>
  );
}
