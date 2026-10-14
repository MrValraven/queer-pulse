import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  CollapseListItem,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_RELEASE_STATUS_LABEL_KEY } from "../studio/api/studio.adapters";
import {
  useAdminStudioSceneReleases,
  useRemoveAdminStudioSceneRelease,
} from "./api/StudioAdminSceneHooks";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import css from "./StudioAdminScenes.module.css";

/** The scene's releases in any status, each with Remove from scene. */
export function StudioAdminSceneReleases({ sceneId }: { sceneId: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const query = useAdminStudioSceneReleases(sceneId);
  const remove = useRemoveAdminStudioSceneRelease();
  const releases = query.data?.pages.flatMap((page) => page.items) ?? [];
  // A failed next page also sets isError; only a first read that failed
  // shows the load line, the footer handles the rest.
  // The line stays open while Try again refetches, keeping focus in the sheet.
  const hasFirstReadFailed =
    query.data === undefined && query.errorUpdateCount > 0;
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} tabIndex={-1} className={css.sheetTitle}>
        {t("admin:studioAdmin.sceneSheet.releases.heading")}
      </h3>
      {/* The empty line waits for a successful read. */}
      <Collapse isOpen={query.isSuccess && releases.length === 0}>
        <p className={css.hint}>
          {t("admin:studioAdmin.sceneSheet.releases.empty")}
        </p>
      </Collapse>
      <Collapse isOpen={hasFirstReadFailed}>
        <div className={css.notice}>
          <p className={css.hint}>{t("admin:studioAdmin.loadError")}</p>
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={query.isFetching || undefined}
            onClick={() => {
              if (query.isFetching) return;
              void query.refetch().then((outcome) => {
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
          {releases.map((release) => (
            // A removed release folds its height away, so the rows below
            // glide up.
            <CollapseListItem key={release.id}>
              <div className={css.sheetRow}>
                <div className={css.sheetRowMain}>
                  <span className={css.sheetRowTitle}>{release.title}</span>
                  <span className={css.sceneMeta}>
                    {release.artist.name} ·{" "}
                    {t(STUDIO_RELEASE_STATUS_LABEL_KEY[release.status])}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t(
                    "admin:studioAdmin.sceneSheet.releases.removeAria",
                    { title: release.title },
                  )}
                  aria-disabled={remove.isPending || undefined}
                  onClick={() => {
                    if (remove.isPending) return;
                    remove.mutate(
                      { sceneId, releaseId: release.id },
                      {
                        onSuccess: () =>
                          showToast(
                            t("admin:studioAdmin.toast.releaseRemoved", {
                              title: release.title,
                            }),
                            "info",
                          ),
                        onError: (cause) =>
                          showToast(
                            t(studioAdminSaveErrorKeyOf(cause)),
                            "error",
                          ),
                      },
                    );
                  }}
                >
                  {t("admin:studioAdmin.sceneSheet.releases.removeCta")}
                </Button>
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={query.hasNextPage || query.isFetchNextPageError}>
        <LoadMoreFooter
          isFetchingNextPage={query.isFetchingNextPage}
          isFetchNextPageError={query.isFetchNextPageError}
          onLoadMore={() => {
            if (!query.isFetchingNextPage) void query.fetchNextPage();
          }}
          label={t("admin:studioAdmin.sceneSheet.releases.showMore")}
          loadingLabel={t("admin:studioAdmin.sceneSheet.releases.loadingMore")}
          errorMessage={t(
            "admin:studioAdmin.sceneSheet.releases.loadMoreError",
          )}
        />
      </Collapse>
    </section>
  );
}
