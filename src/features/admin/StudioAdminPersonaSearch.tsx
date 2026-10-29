import { useId, useState, type RefObject } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
} from "../studio/studioMotion";
import { useAdminStudioLandingPersonaSearch } from "./api/useStudioAdminLanding";
import type { AdminStudioLandingPersonaOptionDTO } from "./api/studioLandingAdmin.api";
import { StudioAdminSearchError } from "./StudioAdminSearchError";
import { AdminChip } from "./ui";
import css from "./StudioAdminLandingCards.module.css";

const SEARCH_DEBOUNCE_MS = 300;

/** Find an artist persona by name or handle. Options the caller cannot pick
 *  stay in the list, disabled, with the reason as a chip. */
export function StudioAdminPersonaSearch({
  onPick,
  isPickable,
  inputRef,
}: {
  onPick: (option: AdminStudioLandingPersonaOptionDTO) => void;
  isPickable: (option: AdminStudioLandingPersonaOptionDTO) => boolean;
  /** The search input, for a dialog that focuses it on open (the modal's
   *  `initialFocusRef`). */
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const search = useAdminStudioLandingPersonaSearch(debouncedQuery);
  const results = search.data ?? [];
  const hasQuery = debouncedQuery.trim().length > 0;
  const hasSearchFailed =
    search.data === undefined && search.errorUpdateCount > 0;
  const isEmpty =
    hasQuery && search.isSuccess && !search.isFetching && results.length === 0;

  return (
    <>
      <label htmlFor={fieldId} className={css.fieldLabel}>
        {t("admin:studioAdmin.landing.personaSearch.label")}
      </label>
      <input
        id={fieldId}
        ref={inputRef}
        type="search"
        className={css.textInput}
        value={query}
        maxLength={STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength}
        placeholder={t("admin:studioAdmin.landing.personaSearch.placeholder")}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div role="status">
        <Collapse isOpen={isEmpty}>
          <p className={css.fieldHint}>
            {t("admin:studioAdmin.landing.personaSearch.noResults")}
          </p>
        </Collapse>
      </div>
      <Collapse isOpen={hasQuery && hasSearchFailed}>
        <StudioAdminSearchError
          className={css.error}
          error={search.error}
          isRetrying={search.isFetching}
          onRetry={() => void search.refetch()}
        />
      </Collapse>
      <Collapse isOpen={hasQuery && results.length > 0}>
        <ul className={css.results}>
          <AnimatePresence initial={false}>
            {results.map((option) => (
              <PersonaResult
                key={option.artist.id}
                option={option}
                isPickable={isPickable(option)}
                onPick={() => onPick(option)}
              />
            ))}
          </AnimatePresence>
        </ul>
      </Collapse>
    </>
  );
}

/** One artist result; folds in and out with the list. */
function PersonaResult({
  option,
  isPickable,
  onPick,
}: {
  option: AdminStudioLandingPersonaOptionDTO;
  isPickable: boolean;
  onPick: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const chipsId = useId();
  const hasChips =
    option.isFoundingArtist || option.hasCard || !option.isEligible;
  return (
    <m.li
      layout="position"
      inert={!isPresent || undefined}
      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
      animate={{
        opacity: 1,
        height: "auto",
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        opacity: 0,
        height: 0,
        overflow: "hidden",
        transition: reducedMotion ? { duration: 0 } : STUDIO_DISCLOSURE_EXIT,
      }}
      transition={reducedMotion ? { duration: 0 } : STUDIO_DISCLOSURE}
    >
      <button
        type="button"
        className={css.result}
        aria-disabled={!isPickable || undefined}
        aria-describedby={hasChips ? chipsId : undefined}
        aria-label={t("admin:studioAdmin.landing.personaSearch.pickLabel", {
          name: option.artist.name,
        })}
        onClick={() => {
          if (isPickable) onPick();
        }}
      >
        <span className={css.resultName}>{option.artist.name}</span>
        {option.artist.handle && (
          <span className={css.resultMeta}>@{option.artist.handle}</span>
        )}
        <span id={chipsId} className={css.chipRow}>
          {option.isFoundingArtist && (
            <AdminChip tone="jade">
              {t("admin:studioAdmin.landing.personaSearch.isFounding")}
            </AdminChip>
          )}
          {option.hasCard && (
            <AdminChip tone="ghost">
              {t("admin:studioAdmin.landing.personaSearch.hasCard")}
            </AdminChip>
          )}
          {!option.isEligible && (
            <AdminChip tone="warn">
              {t("admin:studioAdmin.landing.personaSearch.notEligible")}
            </AdminChip>
          )}
        </span>
      </button>
    </m.li>
  );
}
