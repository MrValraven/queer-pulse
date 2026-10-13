import { FiPlus, FiStar } from "react-icons/fi";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useListingAttributeVocabulary } from "./api/useListingAttributeVocabulary";
import { ANCHOR } from "./listBusiness.data";
import {
  attributeLabel,
  highlightCandidates,
  LISTING_HIGHLIGHT_CAP,
} from "./listingAttributes.data";
import { isNewListingDraft } from "./listingFactSummaries";
import { withOnlyOfferedFacts } from "./listingFactsPayload";
import type { ListingForm } from "./useListingForm";
import pageStyles from "./ListBusinessPage.module.css";
import styles from "./ListingFacts.module.css";

const KEY = "marketing:listBusiness.step2.highlights";

/** "Pick up to 3 for your card": chips of the ticked attributes that may be
 *  a highlight. At three, the unpicked chips go unpickable and stay in the
 *  tab order (`aria-disabled`), so a keyboard or screen-reader user still
 *  finds them; a picked one stays pressable so it can be swapped. Unticking
 *  an attribute above drops its highlight (`withAttributeToggled`). The
 *  count and the chips read the candidates alone, so a stored highlight that
 *  may not be one (a sensitive slug from an older or staff draft) adds
 *  nothing to "1 of 3". On a new draft the candidates are the offered
 *  attributes alone: a create drops a slug a category or kind change left
 *  outside the offer, so it cannot stay picked. An edit keeps those
 *  carried slugs pickable, since the server keeps them. */
export function ListingHighlightPicker({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, toggleHighlight } = form;
  const vocabulary = useListingAttributeVocabulary();
  const candidateAttributes = isNewListingDraft(draft)
    ? withOnlyOfferedFacts(draft, vocabulary).attributes
    : draft.attributes;
  const candidates = highlightCandidates(candidateAttributes ?? [], vocabulary);
  const highlights = (draft.highlights ?? []).filter((slug) =>
    candidates.includes(slug),
  );
  const isAtCap = highlights.length >= LISTING_HIGHLIGHT_CAP;

  return (
    <FormField
      className={pageStyles.lbField}
      id={ANCHOR.highlights}
      label={t(`${KEY}.label`)}
      helper={t(`${KEY}.helper`)}
      labelAside={
        <span className={styles.labelCounter} aria-live="polite">
          {t(`${KEY}.counter`, { count: highlights.length })}
        </span>
      }
    >
      {candidates.length === 0 ? (
        <p className={styles.emptyNote}>{t(`${KEY}.empty`)}</p>
      ) : (
        <div
          className={styles.chipWrap}
          role="group"
          aria-label={t(`${KEY}.aria`)}
        >
          {candidates.map((slug) => {
            const isPicked = highlights.includes(slug);
            const isUnpickable = !isPicked && isAtCap;
            return (
              <button
                key={slug}
                type="button"
                aria-pressed={isPicked}
                aria-disabled={isUnpickable || undefined}
                className={[
                  pageStyles.chip,
                  isPicked && pageStyles.chipOn,
                  styles.tagChip,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (!isUnpickable) toggleHighlight(slug);
                }}
              >
                {isPicked ? (
                  <FiStar size={12} aria-hidden />
                ) : (
                  <FiPlus size={12} aria-hidden />
                )}
                {attributeLabel(t, slug)}
              </button>
            );
          })}
        </div>
      )}
    </FormField>
  );
}
