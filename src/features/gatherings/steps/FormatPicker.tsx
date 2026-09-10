import { useId, useMemo, useState } from "react";
import { normalizeSearchText } from "../../../shared/components/layout/adminNavMatching";
import { RadioCardGroup, SearchInput } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  formatsForFamily,
  findFamily,
  GATHERING_FAMILIES,
  GATHERING_FORMATS,
  MAX_OTHER_FORMAT_LENGTH,
  OTHER_FORMAT_ICON,
  OTHER_FORMAT_KEY,
  OTHER_FORMAT_NAME_KEY,
  OTHER_FORMAT_SUB_KEY,
  type GatheringFamily,
  type GatheringFormatEntry,
} from "../gatheringCatalog";
import { GATE_ANCHOR } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import styles from "../CreateGatheringPage.module.css";

/**
 * Step 1's whole format question: search everything, or narrow by family and
 * pick a card.
 *
 * The old step offered eight cards, of which one was "Other". A picnic, a
 * collage night and a run club had nowhere to go, so the hosts who would run
 * the warmest gatherings picked "Other" or left. Fifty-six cards would be a
 * wall, so they arrive behind nine families, with search across all of them
 * for the host who already knows the word.
 *
 * BOTH GROUPS ARE RADIOGROUPS. `RadioCardGroup` supplies `role="radiogroup"`,
 * `aria-checked`, roving tabindex and arrow-key movement; the visual is
 * entirely this file's existing `.typeCard` classes, so a screen-reader user
 * gets a real group and a sighted user sees exactly the card grid they did
 * before.
 */
export function FormatPicker({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [searchTerm, setSearchTerm] = useState("");

  // Diacritics come off BOTH sides through the same helper the admin rail
  // searches with, so a host typing "convivio" in a hurry still finds
  // "Convívio" and one typing "Convívio" still finds it too.
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const isSearching = normalizedSearchTerm.length > 0;

  // Matched on the TRANSLATED NAME alone, so a Portuguese host finds
  // "piquenique" and an English one finds "picnic". The sub line is deliberately
  // out of it: a result whose visible name has nothing to do with what was
  // typed reads as a bug, since the line that matched is replaced by the
  // family name in search results. Recomputed only when the term or the
  // language moves.
  const searchMatches = useMemo(() => {
    if (!isSearching) return [];
    return GATHERING_FORMATS.filter((format) =>
      normalizeSearchText(t(format.nameKey)).includes(normalizedSearchTerm),
    );
  }, [isSearching, normalizedSearchTerm, t]);

  const visibleFormats: readonly GatheringFormatEntry[] = isSearching
    ? searchMatches
    : form.family
      ? formatsForFamily(form.family)
      : [];

  const familyOptions = GATHERING_FAMILIES.map((family) => ({
    id: family.key,
    render: (
      <>
        <span className={styles.familyChipIcon} aria-hidden>
          <family.icon />
        </span>
        {t(family.nameKey)}
      </>
    ),
  }));

  const formatOptions = [
    ...visibleFormats.map((format) => ({
      id: format.key,
      render: (
        <>
          <span className={styles.typeIcon} aria-hidden>
            <format.icon />
          </span>
          <span className={styles.typeName}>{t(format.nameKey)}</span>
          <span className={styles.typeSub}>
            {isSearching
              ? t(findFamily(format.family)?.nameKey ?? format.subKey)
              : t(format.subKey)}
          </span>
        </>
      ),
    })),
    // "Something else" rides at the end of every family's grid rather than
    // being a family of its own: the host has already said which kind of
    // evening it is, and only the word for it is missing. Hidden while
    // searching, where there is no family to attach it to.
    ...(isSearching || !form.family
      ? []
      : [
          {
            id: OTHER_FORMAT_KEY,
            render: (
              <>
                <span className={styles.typeIcon} aria-hidden>
                  <OTHER_FORMAT_ICON />
                </span>
                <span className={styles.typeName}>
                  {t(OTHER_FORMAT_NAME_KEY)}
                </span>
                <span className={styles.typeSub}>
                  {t(OTHER_FORMAT_SUB_KEY)}
                </span>
              </>
            ),
          },
        ]),
  ];

  /** Picking a card: inside a family the family is already known, and out of
   *  the search results it comes from the format's own row. */
  const chooseFormat = (formatKey: string) => {
    const match = GATHERING_FORMATS.find((format) => format.key === formatKey);
    const nextFamily: GatheringFamily | "" = match ? match.family : form.family;
    if (!nextFamily) return;
    form.selectFormat(nextFamily, formatKey);
    setSearchTerm("");
  };

  /**
   * The one line under the grid, or null when nothing is outstanding.
   *
   * NO FAMILY IS PRESELECTED, so the very first thing a host sees is an empty
   * grid, and the hint has to name the family row rather than a set of cards
   * that is not on screen yet. Once a family is chosen the old line stands
   * ("Pick a format to get started"), and a search that found nothing gets its
   * own.
   */
  const pendingHintKey = isSearching
    ? formatOptions.length === 0
      ? "gatherings:create.step1.searchEmpty"
      : null
    : !form.family
      ? "gatherings:create.step1.familyRequired"
      : !form.format
        ? "gatherings:create.step1.typeRequired"
        : null;

  return (
    <div>
      <SearchInput
        className={styles.formatSearch}
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={t("gatherings:create.step1.searchPlaceholder")}
        ariaLabel={t("gatherings:create.step1.searchLabel")}
      />

      {/* The gate anchor wraps the two pickers and NOT the search field, so
          the checklist's "Pick a format" row lands focus on a family chip
          rather than in a search box the host never asked to type in. */}
      <div id={GATE_ANCHOR.type}>
        {!isSearching && (
          <>
            <div className={styles.label} id={`${fieldId}-family-label`}>
              {t("gatherings:create.step1.familyLabel")}
            </div>
            <RadioCardGroup<GatheringFamily>
              value={form.family}
              onChange={(familyKey) => form.selectFamily(familyKey)}
              options={familyOptions}
              ariaLabel={t("gatherings:create.step1.familyLabel")}
              ariaLabelledBy={`${fieldId}-family-label`}
              className={styles.familyRow}
              optionClassName={styles.familyChip}
              checkedClassName={styles.familyChipSelected}
            />
          </>
        )}

        <div className={styles.label} id={`${fieldId}-format-label`}>
          {t(
            isSearching
              ? "gatherings:create.step1.searchResultsLabel"
              : "gatherings:create.step1.formatLabel",
          )}
        </div>
        {formatOptions.length > 0 && (
          <RadioCardGroup<string>
            value={isSearching ? "" : form.format}
            onChange={chooseFormat}
            options={formatOptions}
            ariaLabel={t("gatherings:create.step1.formatLabel")}
            ariaLabelledBy={`${fieldId}-format-label`}
            className={styles.types}
            optionClassName={styles.typeCard}
            checkedClassName={styles.typeCardSelected}
          />
        )}
        {pendingHintKey && <p className={styles.hint}>{t(pendingHintKey)}</p>}
      </div>

      {form.format === OTHER_FORMAT_KEY && (
        <div id={GATE_ANCHOR.format}>
          <label className={styles.label} htmlFor={`${fieldId}-other`}>
            {t("gatherings:create.step1.otherLabel")}
          </label>
          <input
            id={`${fieldId}-other`}
            className={styles.input}
            type="text"
            maxLength={MAX_OTHER_FORMAT_LENGTH}
            placeholder={t("gatherings:create.step1.otherPlaceholder")}
            required
            aria-invalid={!form.otherText.trim()}
            aria-describedby={
              !form.otherText.trim() ? `${fieldId}-other-hint` : undefined
            }
            value={form.otherText}
            onChange={(event) => form.setOtherText(event.target.value)}
          />
          {!form.otherText.trim() && (
            <p id={`${fieldId}-other-hint`} className={styles.hint}>
              {t("gatherings:create.step1.otherRequired")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
