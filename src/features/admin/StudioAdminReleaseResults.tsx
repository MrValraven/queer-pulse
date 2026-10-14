import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioReleaseCardDTO } from "./api/studioDiscoveryAdmin.api";
import css from "./StudioAdminPage.module.css";

/** The body of the release search in the pick dialog: searching line,
 *  failed line, empty line or the result list. */
export function StudioAdminReleaseResults({
  results,
  isFetching,
  isError,
  chosenId,
  takenIds,
  onChoose,
}: {
  results: AdminStudioReleaseCardDTO[];
  isFetching: boolean;
  isError: boolean;
  chosenId: string | null;
  /** Releases already on the shelf: shown with a chip and impossible to choose. */
  takenIds: ReadonlySet<string>;
  onChoose: (release: AdminStudioReleaseCardDTO) => void;
}) {
  const { t } = useTranslation();
  const chipIdPrefix = useId();
  if (isFetching && results.length === 0)
    return (
      <p className={css.fieldHint} role="status">
        {t("admin:studioAdmin.pickDialog.searching")}
      </p>
    );
  if (isError && results.length === 0)
    return (
      <p className={css.error} role="alert">
        {t("admin:studioAdmin.searchError")}
      </p>
    );
  if (results.length === 0)
    return (
      <p className={css.fieldHint} role="status">
        {t("admin:studioAdmin.pickDialog.noResults")}
      </p>
    );
  return (
    <ul
      className={css.results}
      aria-label={t("admin:studioAdmin.pickDialog.resultsLabel")}
    >
      {results.map((release) => {
        const isTaken = takenIds.has(release.id);
        const chipId = `${chipIdPrefix}-${release.id}`;
        return (
          <li key={release.id}>
            <button
              type="button"
              className={css.result}
              aria-pressed={isTaken ? undefined : chosenId === release.id}
              aria-disabled={isTaken || undefined}
              aria-describedby={isTaken ? chipId : undefined}
              onClick={() => {
                if (!isTaken) onChoose(release);
              }}
            >
              <span className={css.resultTitle}>{release.title}</span>
              <span className={css.resultMeta}>{release.artist.name}</span>
              {isTaken && (
                <span id={chipId} className={css.resultChip}>
                  {t("admin:studioAdmin.pick.onShelf")}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
