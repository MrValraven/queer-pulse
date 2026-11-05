import { useId } from "react";
import { FiAlertCircle, FiSearch } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  PersonaWallPersonaDTO,
  PersonaWallSearchResultDTO,
} from "../../subprofiles/api/personaWall.api";
import type { PersonaWallCandidateSearch } from "../api/useAdminPersonaWall";
import pickCss from "../StudioAdminPickDialog.module.css";
import {
  PERSONA_WALL_ERROR_VALUES,
  personaKindLabelKey,
  personaWallErrorKeyOf,
} from "./personaWallAdmin.model";
import { PersonaWallThumb } from "./PersonaWallThumb";
import css from "./PersonaWallAddDialog.module.css";

type SearchView = "idle" | "searching" | "error" | "empty" | "results";

/** Which state the results area shows. A search that is still settling
 *  wins over idle, since both hold for a moment after the first keystroke,
 *  and held results stay on screen while the next term loads. */
function searchViewOf(search: PersonaWallCandidateSearch): SearchView {
  if (search.isError) return "error";
  if (search.results.length > 0) return "results";
  if (search.isSearching) return "searching";
  if (search.isIdle) return "idle";
  return "empty";
}

/** The Add persona dialog's results: an idle prompt, a searching line, the
 *  named reason a search failed with a retry, a no-match line, or the
 *  matching personas. Each state folds through `Collapse`, so they cross
 *  fade. A persona already on the wall shows a tag, and every result stops
 *  reacting while the wall is full or a write is in flight. */
export function PersonaWallSearchResults({
  search,
  isFull,
  isBusy,
  onChoose,
}: {
  search: PersonaWallCandidateSearch;
  isFull: boolean;
  isBusy: boolean;
  onChoose: (persona: PersonaWallPersonaDTO) => void;
}) {
  const { t } = useTranslation();
  const listLabelId = useId();
  const pickedTagBaseId = useId();
  const view = searchViewOf(search);
  const errorLine = t(
    personaWallErrorKeyOf(search.error),
    PERSONA_WALL_ERROR_VALUES,
  );
  const emptyLine = t("admin:personaWall.addDialog.noResults", {
    query: search.term,
  });
  // One live region that stays mounted, so a screen reader hears each state
  // change. The folded lines below only draw it.
  const announcement: Record<SearchView, string> = {
    idle: "",
    searching: t("admin:personaWall.addDialog.searching"),
    error: `${t("admin:personaWall.addDialog.searchErrorTitle")}. ${errorLine}`,
    empty: emptyLine,
    results: "",
  };

  function renderResult(result: PersonaWallSearchResultDTO) {
    const { persona, isPicked } = result;
    const isDisabled = isPicked || isFull || isBusy;
    const kindKey = personaKindLabelKey(persona.kind);
    const pickedTagId = `${pickedTagBaseId}-${persona.id}`;
    return (
      <li key={persona.id} className={pickCss.resultItem}>
        <button
          type="button"
          className={pickCss.result}
          aria-label={t("admin:personaWall.addDialog.addResultAria", {
            name: persona.displayName,
          })}
          aria-disabled={isDisabled || undefined}
          aria-describedby={isPicked ? pickedTagId : undefined}
          onClick={() => {
            if (!isDisabled) onChoose(persona);
          }}
        >
          <PersonaWallThumb persona={persona} size={40} />
          <span className={css.resultText}>
            <span className={css.name}>{persona.displayName}</span>
            {kindKey ? <span className={css.kind}>{t(kindKey)}</span> : null}
          </span>
          {isPicked ? (
            <span id={pickedTagId} className={pickCss.resultChip}>
              {t("admin:personaWall.addDialog.alreadyPicked")}
            </span>
          ) : null}
        </button>
      </li>
    );
  }

  return (
    <div className={css.resultsArea}>
      <p className="visuallyHidden" role="status">
        {announcement[view]}
      </p>
      <Collapse isOpen={view === "idle"}>
        <p className={css.resultsLine}>
          <FiSearch className={css.resultsIcon} aria-hidden />
          {t("admin:personaWall.addDialog.idle")}
        </p>
      </Collapse>
      <Collapse isOpen={view === "searching"}>
        <p className={css.resultsLine}>
          {t("admin:personaWall.addDialog.searching")}
        </p>
      </Collapse>
      <Collapse isOpen={view === "error"}>
        <div className={css.resultsError}>
          <FiAlertCircle className={css.resultsIcon} aria-hidden />
          <p className={css.resultsErrorTitle}>
            {t("admin:personaWall.addDialog.searchErrorTitle")}
          </p>
          <p className={css.resultsLine}>{errorLine}</p>
          <Button variant="ghost" size="sm" onClick={search.retry}>
            {t("admin:personaWall.addDialog.searchRetryCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={view === "empty"}>
        <p className={css.resultsLine}>{emptyLine}</p>
      </Collapse>
      <Collapse isOpen={view === "results"}>
        <p id={listLabelId} className={css.resultsHeading}>
          {t("admin:personaWall.addDialog.resultsLabel")}
        </p>
        <div className={css.resultsScroll}>
          <ul
            className={`${pickCss.results} ${css.resultsList}`}
            aria-labelledby={listLabelId}
            aria-busy={search.isSearching || undefined}
          >
            {search.results.map(renderResult)}
          </ul>
        </div>
      </Collapse>
    </div>
  );
}
