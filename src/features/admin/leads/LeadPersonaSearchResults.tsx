import { useId } from "react";
import { FiAlertCircle, FiSearch } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { personaKindLabelKey } from "../personaWall/personaWallAdmin.model";
import pickCss from "../StudioAdminPickDialog.module.css";
import type {
  LeadPersonaDTO,
  LeadPersonaSearch,
  LeadPersonaSearchResultDTO,
} from "./api/leads.types";
import { leadErrorKeyOf, leadErrorValuesOf } from "./leadErrors";
import { LeadPersonaThumb } from "./LeadPersonaThumb";
import styles from "./LeadPersona.module.css";

type SearchView = "idle" | "searching" | "error" | "empty" | "results";

/** Which state the results area shows. A failure wins; held results stay on
 *  screen while the next term loads; a search still settling wins over idle,
 *  since both hold for a moment after the first keystroke. */
function searchViewOf(search: LeadPersonaSearch): SearchView {
  if (search.isError) return "error";
  if (search.results.length > 0) return "results";
  if (search.isSearching) return "searching";
  if (search.isIdle) return "idle";
  return "empty";
}

/**
 * The Link persona dialog's results: an idle prompt, a searching line, the
 * named reason a search failed with Search again, a no-match line, or the
 * matching personas. Each state folds through `Collapse`, so they cross
 * fade. A persona linked to another lead names that lead and cannot be
 * chosen; one linked to this same lead can. While a write is in flight no
 * result reacts.
 */
export function LeadPersonaSearchResults({
  search,
  currentLeadId,
  isBusy,
  onChoose,
}: {
  search: LeadPersonaSearch;
  currentLeadId: string;
  isBusy: boolean;
  onChoose: (persona: LeadPersonaDTO) => void;
}) {
  const { t } = useTranslation();
  const listLabelId = useId();
  const linkedTagBaseId = useId();
  const view = searchViewOf(search);
  const errorLine = t(
    leadErrorKeyOf(search.error),
    leadErrorValuesOf(search.error),
  );
  const emptyLine = t("admin:leads.personaDialog.noResults", {
    query: search.term,
  });
  // One live region that stays mounted, so a screen reader hears each state
  // change. The folded lines below only draw it.
  const announcement: Record<SearchView, string> = {
    idle: "",
    searching: t("admin:leads.personaDialog.searching"),
    error: `${t("admin:leads.personaDialog.searchErrorTitle")}. ${errorLine}`,
    empty: emptyLine,
    results: "",
  };

  function renderResult({ persona, linkedLead }: LeadPersonaSearchResultDTO) {
    const isLinkedElsewhere =
      linkedLead !== null && linkedLead.id !== currentLeadId;
    const isDisabled = isLinkedElsewhere || isBusy;
    const kindLabelKey = personaKindLabelKey(persona.kind);
    const linkedTagId = `${linkedTagBaseId}-${persona.id}`;
    return (
      <li key={persona.id} className={pickCss.resultItem}>
        <button
          type="button"
          className={`${pickCss.result} ${styles.resultButton}`}
          aria-label={t("admin:leads.personaDialog.chooseAria", {
            name: persona.displayName,
          })}
          aria-disabled={isDisabled || undefined}
          aria-describedby={isLinkedElsewhere ? linkedTagId : undefined}
          onClick={() => {
            if (!isDisabled) onChoose(persona);
          }}
        >
          <LeadPersonaThumb persona={persona} size={40} />
          <span className={styles.resultText}>
            <span className={styles.resultName}>{persona.displayName}</span>
            <span className={styles.meta}>
              {persona.handle ? (
                <span className={styles.handle}>@{persona.handle}</span>
              ) : null}
              {kindLabelKey ? (
                <span className={styles.kind}>{t(kindLabelKey)}</span>
              ) : null}
            </span>
          </span>
          {isLinkedElsewhere ? (
            <span id={linkedTagId} className={styles.linkedTag}>
              {t("admin:leads.personaDialog.linkedElsewhere", {
                name: linkedLead?.name ?? "",
              })}
            </span>
          ) : null}
        </button>
      </li>
    );
  }

  return (
    <div className={styles.resultsArea}>
      <p className="visuallyHidden" role="status">
        {announcement[view]}
      </p>
      <Collapse isOpen={view === "idle"}>
        <p className={styles.resultsLine}>
          <FiSearch className={styles.resultsIcon} aria-hidden />
          {t("admin:leads.personaDialog.idle")}
        </p>
      </Collapse>
      <Collapse isOpen={view === "searching"}>
        <p className={styles.resultsLine}>
          {t("admin:leads.personaDialog.searching")}
        </p>
      </Collapse>
      <Collapse isOpen={view === "error"}>
        <div className={styles.resultsError}>
          <FiAlertCircle className={styles.resultsIcon} aria-hidden />
          <p className={styles.resultsErrorTitle}>
            {t("admin:leads.personaDialog.searchErrorTitle")}
          </p>
          <p className={styles.resultsLine}>{errorLine}</p>
          <Button variant="ghost" size="sm" onClick={search.retry}>
            {t("admin:leads.personaDialog.retryCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={view === "empty"}>
        <p className={styles.resultsLine}>{emptyLine}</p>
      </Collapse>
      <Collapse isOpen={view === "results"}>
        <p id={listLabelId} className={styles.resultsHeading}>
          {t("admin:leads.personaDialog.resultsLabel")}
        </p>
        <div className={styles.resultsScroll}>
          <ul
            className={`${pickCss.results} ${styles.resultsList}`}
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
