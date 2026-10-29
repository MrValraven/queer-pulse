import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import { useAdminStudioLandingTrackSearch } from "./api/useStudioAdminLanding";
import { useRequestLandingPreview } from "./api/useStudioAdminLandingMutations";
import type { AdminStudioLandingTrackOptionDTO } from "./api/studioLandingAdmin.api";
import {
  ineligibleLabelKeyOf,
  ineligibleReasonOfError,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";
import { StudioAdminLandingTrackResult } from "./StudioAdminLandingTrackResult";
import { StudioAdminSearchError } from "./StudioAdminSearchError";
import css from "./StudioAdminLanding.module.css";

const SEARCH_DEBOUNCE_MS = 300;
const UNKNOWN_REASON_KEY =
  "admin:studioAdmin.landing.previews.ineligible.unknown";

/** A reason a 422 named for one track, good for the search read it came
 *  from. A refreshed search carries a new `dataUpdatedAt` and drops it. */
interface TrackRefusal {
  reason: string;
  searchUpdatedAt: number;
}

/** Ask to play a track: search published tracks, then ask the artist. A
 *  track that cannot play, or already has an open request, shows why and
 *  cannot be asked. */
export function StudioAdminLandingTrackDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && <TrackDialogBody onClose={onClose} />}
    </AnimatePresence>
  );
}

function TrackDialogBody({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const searchFieldId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [refusals, setRefusals] = useState<Record<string, TrackRefusal>>({});
  const [errorText, setErrorText] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const search = useAdminStudioLandingTrackSearch(debouncedQuery);
  const request = useRequestLandingPreview();
  const results = search.data ?? [];
  const hasQuery = debouncedQuery.trim().length > 0;
  const hasSearchFailed =
    search.data === undefined && search.errorUpdateCount > 0;

  function ask(option: AdminStudioLandingTrackOptionDTO) {
    if (request.isPending) return;
    setErrorText(null);
    request.mutate(
      { trackId: option.track.id },
      {
        onSuccess: () => {
          showToast(
            t("admin:studioAdmin.landing.previews.requested", {
              track: option.track.title,
            }),
            "success",
          );
          onClose();
        },
        onError: (cause) => {
          const reason = ineligibleReasonOfError(cause);
          if (reason === null) {
            setErrorText(t(studioAdminSaveErrorKeyOf(cause)));
            return;
          }
          setRefusals((previous) => ({
            ...previous,
            [option.track.id]: {
              reason,
              searchUpdatedAt: search.dataUpdatedAt,
            },
          }));
          setErrorText(
            t("admin:studioAdmin.landing.previews.notEligibleBecause", {
              reason: t(ineligibleLabelKeyOf(reason) ?? UNKNOWN_REASON_KEY),
            }),
          );
        },
      },
    );
  }

  return (
    <Modal
      title={t("admin:studioAdmin.landing.trackDialog.title")}
      onClose={onClose}
      initialFocusRef={searchRef}
      wide
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("admin:common.cancel")}
        </Button>
      }
    >
      <div className={css.dialogForm}>
        <label htmlFor={searchFieldId} className={css.fieldLabel}>
          {t("admin:studioAdmin.landing.trackDialog.searchLabel")}
        </label>
        <input
          id={searchFieldId}
          ref={searchRef}
          type="search"
          className={css.textInput}
          value={query}
          placeholder={t("admin:studioAdmin.landing.trackDialog.placeholder")}
          maxLength={STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength}
          onChange={(event) => {
            setQuery(event.target.value);
            setErrorText(null);
          }}
        />
        <Collapse isOpen={errorText !== null}>
          <p className={css.error} role="alert">
            {errorText}
          </p>
        </Collapse>
        <Collapse
          isOpen={hasQuery && search.isFetching && results.length === 0}
        >
          <p className={css.hint} role="status">
            {t("admin:studioAdmin.pickDialog.searching")}
          </p>
        </Collapse>
        <Collapse isOpen={hasQuery && hasSearchFailed}>
          <StudioAdminSearchError
            className={css.error}
            error={search.error}
            isRetrying={search.isFetching}
            onRetry={() => void search.refetch()}
          />
        </Collapse>
        <Collapse isOpen={hasQuery && search.isSuccess && results.length === 0}>
          <p className={css.hint} role="status">
            {t("admin:studioAdmin.landing.trackDialog.noResults")}
          </p>
        </Collapse>
        <ul
          className={css.results}
          aria-label={t("admin:studioAdmin.pickDialog.resultsLabel")}
        >
          <AnimatePresence initial={false}>
            {hasQuery &&
              results.map((option) => {
                const refusal = refusals[option.track.id];
                const refusedReason =
                  refusal && refusal.searchUpdatedAt === search.dataUpdatedAt
                    ? refusal.reason
                    : null;
                return (
                  <StudioAdminLandingTrackResult
                    key={option.track.id}
                    option={option}
                    reason={option.ineligibleReason ?? refusedReason}
                    isBusy={request.isPending}
                    onAsk={() => ask(option)}
                  />
                );
              })}
          </AnimatePresence>
        </ul>
      </div>
    </Modal>
  );
}
