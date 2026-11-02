import { useId } from "react";
import { FiAlertCircle, FiSearch } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminDirectoryPartnerSearchResultDTO } from "../marketing/api/directoryPartners.api";
import type { DirectoryPartnerCandidateSearch } from "./api/useAdminDirectoryPartners";
import {
  DIRECTORY_PARTNER_ERROR_VALUES,
  directoryPartnerErrorKeyOf,
} from "./adminDirectoryPartners.model";
import { AdminDirectoryPartnerThumb } from "./AdminDirectoryPartnerThumb";
import pickCss from "./StudioAdminPickDialog.module.css";
import css from "./AdminDirectoryPartners.module.css";

type SearchView = "idle" | "searching" | "error" | "empty" | "results";

/** Which state the results area shows. A search that is still settling
 *  wins over idle, since both hold for a moment after the first keystroke,
 *  and held results stay on screen while the next term loads. */
function searchViewOf(search: DirectoryPartnerCandidateSearch): SearchView {
  if (search.isError) return "error";
  if (search.results.length > 0) return "results";
  if (search.isSearching) return "searching";
  if (search.isIdle) return "idle";
  return "empty";
}

/** The Add partner picker's results: an idle prompt, a searching line, the
 *  named reason a search failed with a retry, a no-match line, or the
 *  matching listings. Each state folds through `Collapse`, so they cross
 *  fade. A listing that is already a partner shows a tag and can't be
 *  chosen. */
export function AdminDirectoryPartnerSearchResults({
  search,
  chosenId,
  onChoose,
}: {
  search: DirectoryPartnerCandidateSearch;
  chosenId: string | null;
  onChoose: (result: AdminDirectoryPartnerSearchResultDTO) => void;
}) {
  const { t } = useTranslation();
  const listLabelId = useId();
  const view = searchViewOf(search);
  const errorLine = t(
    directoryPartnerErrorKeyOf(search.error),
    DIRECTORY_PARTNER_ERROR_VALUES,
  );
  const emptyLine = t("admin:directoryPartners.addDialog.noResults", {
    query: search.term,
  });
  // One live region that stays mounted, so a screen reader hears each state
  // change. The folded lines below only draw it.
  const announcement: Record<SearchView, string> = {
    idle: "",
    searching: t("admin:directoryPartners.addDialog.searching"),
    error: `${t("admin:directoryPartners.addDialog.searchErrorTitle")}. ${errorLine}`,
    empty: emptyLine,
    results: "",
  };
  return (
    <div className={css.resultsArea}>
      <p className="visuallyHidden" role="status">
        {announcement[view]}
      </p>
      <Collapse isOpen={view === "idle"}>
        <p className={css.resultsLine}>
          <FiSearch className={css.resultsIcon} aria-hidden />
          {t("admin:directoryPartners.addDialog.idle")}
        </p>
      </Collapse>
      <Collapse isOpen={view === "searching"}>
        <p className={css.resultsLine}>
          {t("admin:directoryPartners.addDialog.searching")}
        </p>
      </Collapse>
      <Collapse isOpen={view === "error"}>
        <div className={css.resultsError}>
          <FiAlertCircle className={css.resultsIcon} aria-hidden />
          <p className={css.resultsErrorTitle}>
            {t("admin:directoryPartners.addDialog.searchErrorTitle")}
          </p>
          <p className={css.resultsLine}>{errorLine}</p>
          <Button variant="ghost" size="sm" onClick={search.retry}>
            {t("admin:directoryPartners.addDialog.searchRetryCta")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={view === "empty"}>
        <p className={css.resultsLine}>{emptyLine}</p>
      </Collapse>
      <Collapse isOpen={view === "results"}>
        <p id={listLabelId} className={css.resultsHeading}>
          {t("admin:directoryPartners.addDialog.resultsLabel")}
        </p>
        <div className={css.resultsScroll}>
          <ul
            className={`${pickCss.results} ${css.resultsList}`}
            aria-labelledby={listLabelId}
            aria-busy={search.isSearching || undefined}
          >
            {search.results.map((result) => (
              <li key={result.listingId} className={pickCss.resultItem}>
                <button
                  type="button"
                  className={pickCss.result}
                  aria-pressed={chosenId === result.listingId}
                  aria-disabled={result.isPartner || undefined}
                  onClick={() => {
                    if (!result.isPartner) onChoose(result);
                  }}
                >
                  <AdminDirectoryPartnerThumb
                    coverImage={null}
                    tint={result.tint}
                    initials={result.av}
                  />
                  <span className={css.resultText}>
                    <span className={css.name}>{result.name}</span>
                    {result.hood ? (
                      <span className={css.hood}>{result.hood}</span>
                    ) : null}
                  </span>
                  {result.isPartner ? (
                    <span className={pickCss.resultChip}>
                      {t("admin:directoryPartners.addDialog.alreadyPartner")}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Collapse>
    </div>
  );
}
