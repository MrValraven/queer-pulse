import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, CollapseListItem } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import {
  useAdminStudioEventSearch,
  useAdminStudioSceneEvents,
  usePinAdminStudioSceneEvent,
  useUnpinAdminStudioSceneEvent,
} from "./api/StudioAdminSceneHooks";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { AdminChip } from "./ui";
import css from "./StudioAdminScenes.module.css";

const SEARCH_DEBOUNCE_MS = 250;
const EVENT_DATE: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

/** Pinned events (each with Unpin event, past ones marked) and a title
 *  search over upcoming open events to pin more. The server leaves events
 *  hosted by a space out of the search. */
export function StudioAdminSceneEvents({ sceneId }: { sceneId: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const headingId = useId();
  const searchFieldId = useId();
  const pinnedQuery = useAdminStudioSceneEvents(sceneId);
  const pinned = pinnedQuery.data ?? [];
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const search = useAdminStudioEventSearch(debouncedQuery);
  const results = search.data ?? [];
  const pin = usePinAdminStudioSceneEvent();
  const unpin = useUnpinAdminStudioSceneEvent();
  const pinnedIds = new Set(pinned.map((event) => event.eventId));
  const hasQuery = debouncedQuery.trim().length > 0;
  // The error line stays open while Try again refetches, so focus on the
  // button survives; a first read that never loaded keeps it.
  const hasFirstReadFailed =
    pinnedQuery.data === undefined && pinnedQuery.errorUpdateCount > 0;
  // A refused pin (422 studio_scene_event_not_pinnable) reads its own line.
  const toastSaveError = (cause: unknown) =>
    showToast(t(studioAdminSaveErrorKeyOf(cause)), "error");

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} tabIndex={-1} className={css.sheetTitle}>
        {t("admin:studioAdmin.sceneSheet.events.heading")}
      </h3>
      <p className={css.fieldHint}>
        {t("admin:studioAdmin.sceneSheet.events.hint")}
      </p>
      {/* The empty line waits for a successful read, so it never flashes
          before the pins arrive. */}
      <Collapse isOpen={pinnedQuery.isSuccess && pinned.length === 0}>
        <p className={css.hint}>
          {t("admin:studioAdmin.sceneSheet.events.empty")}
        </p>
      </Collapse>
      <Collapse isOpen={hasFirstReadFailed}>
        <div className={css.notice}>
          <p className={css.hint}>{t("admin:studioAdmin.loadError")}</p>
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={pinnedQuery.isFetching || undefined}
            onClick={() => {
              if (pinnedQuery.isFetching) return;
              void pinnedQuery.refetch().then((outcome) => {
                if (outcome.isSuccess)
                  document.getElementById(headingId)?.focus();
              });
            }}
          >
            {t("admin:studioAdmin.retryCta")}
          </Button>
        </div>
      </Collapse>
      <ul className={css.sheetList}>
        <AnimatePresence initial={false}>
          {pinned.map((event) => (
            // An unpinned event folds its height away, so the rows below
            // glide up.
            <CollapseListItem key={event.eventId}>
              <div className={css.sheetRow}>
                <div className={css.sheetRowMain}>
                  <span className={css.sheetRowTitle}>{event.title}</span>
                  <span className={css.sceneMeta}>
                    {fmt.date(new Date(event.startAt), EVENT_DATE)}
                    {event.neighbourhood ? ` · ${event.neighbourhood}` : ""}
                  </span>
                  {!event.isUpcoming && (
                    <AdminChip tone="ghost">
                      {t("admin:studioAdmin.sceneSheet.events.past")}
                    </AdminChip>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t(
                    "admin:studioAdmin.sceneSheet.events.unpinAria",
                    {
                      title: event.title,
                    },
                  )}
                  aria-disabled={unpin.isPending || undefined}
                  onClick={() => {
                    if (unpin.isPending) return;
                    unpin.mutate(
                      { sceneId, eventId: event.eventId },
                      {
                        onSuccess: () =>
                          showToast(
                            t("admin:studioAdmin.toast.eventUnpinned"),
                            "info",
                          ),
                        onError: toastSaveError,
                      },
                    );
                  }}
                >
                  {t("admin:studioAdmin.sceneSheet.events.unpinCta")}
                </Button>
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <label htmlFor={searchFieldId} className={css.fieldLabel}>
        {t("admin:studioAdmin.sceneSheet.events.searchLabel")}
      </label>
      <input
        id={searchFieldId}
        type="search"
        className={css.textInput}
        value={query}
        maxLength={STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Collapse isOpen={hasQuery}>
        {results.length === 0 ? (
          <p
            className={search.isError ? css.error : css.hint}
            role={search.isError ? "alert" : "status"}
          >
            {t(
              search.isFetching
                ? "admin:studioAdmin.pickDialog.searching"
                : search.isError
                  ? "admin:studioAdmin.searchError"
                  : "admin:studioAdmin.sceneSheet.events.noResults",
            )}
          </p>
        ) : (
          <ul
            className={css.sheetList}
            aria-label={t("admin:studioAdmin.sceneSheet.events.resultsLabel")}
          >
            {results.map((option) => (
              <li key={option.id} className={css.sheetRow}>
                <div className={css.sheetRowMain}>
                  <span className={css.sheetRowTitle}>{option.title}</span>
                  <span className={css.sceneMeta}>
                    {fmt.date(new Date(option.startAt), EVENT_DATE)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("admin:studioAdmin.sceneSheet.events.pinAria", {
                    title: option.title,
                  })}
                  aria-disabled={
                    pin.isPending || pinnedIds.has(option.id) || undefined
                  }
                  aria-describedby={
                    pinnedIds.has(option.id) ? headingId : undefined
                  }
                  onClick={() => {
                    if (pin.isPending || pinnedIds.has(option.id)) return;
                    pin.mutate(
                      { sceneId, event: option },
                      {
                        onSuccess: () =>
                          showToast(
                            t("admin:studioAdmin.toast.eventPinned"),
                            "info",
                          ),
                        onError: toastSaveError,
                      },
                    );
                  }}
                >
                  {t("admin:studioAdmin.sceneSheet.events.pinCta")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Collapse>
    </section>
  );
}
