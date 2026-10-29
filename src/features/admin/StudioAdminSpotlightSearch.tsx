import { useId, useState, type RefObject } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
} from "../studio/studioMotion";
import { useAdminStudioSpotlightArtistSearch } from "./api/StudioAdminSpotlightHooks";
import type {
  AdminStudioSpotlightArtistOptionDTO,
  StudioSpotlightSlot,
} from "./api/studioSpotlightAdmin.api";
import { StudioAdminSearchError } from "./StudioAdminSearchError";
import { AdminAvatar, AdminChip } from "./ui";
import css from "./StudioAdminSpotlight.module.css";

const SEARCH_DEBOUNCE_MS = 300;

/** Find a Studio artist by name or handle. For New stars, an artist already
 *  on the list stays in the results, unpickable and listed last, with the
 *  reason as a chip. */
export function StudioAdminSpotlightSearch({
  slot,
  takenArtistIds,
  chosenArtistId,
  onChoose,
  inputRef,
}: {
  slot: StudioSpotlightSlot;
  takenArtistIds: ReadonlySet<string>;
  chosenArtistId: string | null;
  onChoose: (option: AdminStudioSpotlightArtistOptionDTO) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const search = useAdminStudioSpotlightArtistSearch(debouncedQuery);
  const results = search.data ?? [];
  const trimmedQuery = debouncedQuery.trim();
  const hasQuery = trimmedQuery.length > 0;
  const hasSearchFailed =
    search.data === undefined && search.errorUpdateCount > 0;
  const isEmpty =
    hasQuery && search.isSuccess && !search.isFetching && results.length === 0;
  // The spotlight read is the truth after every write, so the taken set
  // comes from it alone. The month slot takes anyone, since picking the
  // same artist again renews the pick.
  const isTaken = (option: AdminStudioSpotlightArtistOptionDTO) =>
    slot === "new_stars" && takenArtistIds.has(option.artist.id);
  // A stable sort keeps the server's order within the pickable and the
  // taken results.
  const sortedResults = [...results].sort(
    (first, second) => Number(isTaken(first)) - Number(isTaken(second)),
  );

  return (
    <>
      <label htmlFor={fieldId} className={css.fieldLabel}>
        {t("admin:studioAdmin.spotlight.searchLabel")}
      </label>
      <input
        id={fieldId}
        ref={inputRef}
        type="search"
        className={css.textInput}
        value={query}
        maxLength={STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength}
        onChange={(event) => setQuery(event.target.value)}
        // The results follow the typing, so Enter here never saves the form.
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
      />
      <div role="status">
        <Collapse isOpen={isEmpty}>
          <p className={css.fieldHint}>
            {t("admin:studioAdmin.spotlight.searchEmpty", { q: trimmedQuery })}
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
            {sortedResults.map((option) => (
              <ArtistResult
                key={option.artist.id}
                option={option}
                isTaken={isTaken(option)}
                isChosen={option.artist.id === chosenArtistId}
                onChoose={() => onChoose(option)}
              />
            ))}
          </AnimatePresence>
        </ul>
      </Collapse>
    </>
  );
}

/** One artist result; folds in and out with the list. */
function ArtistResult({
  option,
  isTaken,
  isChosen,
  onChoose,
}: {
  option: AdminStudioSpotlightArtistOptionDTO;
  isTaken: boolean;
  isChosen: boolean;
  onChoose: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const chipsId = useId();
  const { artist } = option;
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
        aria-disabled={isTaken || undefined}
        aria-pressed={isChosen}
        aria-describedby={isTaken ? chipsId : undefined}
        aria-label={t("admin:studioAdmin.spotlight.pickAria", {
          name: artist.name,
        })}
        onClick={() => {
          if (!isTaken) onChoose();
        }}
      >
        <AdminAvatar
          size="sm"
          src={artist.avatarUrl ?? undefined}
          initials={initialsFromName(artist.name, "?")}
          alt=""
        />
        <span className={css.resultText}>
          <span className={css.resultName}>{artist.name}</span>
          {artist.handle && (
            <span className={css.resultMeta}>@{artist.handle}</span>
          )}
          {option.latestReleaseTitle && (
            <span className={css.resultMeta}>{option.latestReleaseTitle}</span>
          )}
        </span>
        <span id={chipsId} className={css.chipRow}>
          {isTaken && (
            <AdminChip tone="ghost">
              {t("admin:studioAdmin.spotlight.alreadyThere")}
            </AdminChip>
          )}
        </span>
        <FiCheck aria-hidden className={css.resultCheck} />
      </button>
    </m.li>
  );
}
