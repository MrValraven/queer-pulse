import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiExternalLink,
  FiCopy,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import {
  Button,
  DetailRows,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminDrawer, AdminPageHeader } from "./ui";
import { AdminMediaCard } from "./AdminMediaCard";
import {
  AdminMediaDeleteConfirm,
  type AdminMediaDeleteRefusal,
} from "./AdminMediaDeleteConfirm";
import { AdminMediaReferenceList } from "./AdminMediaReferences";
import { AdminMediaFilters } from "./AdminMediaFilters";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { absoluteFileUrl } from "./adminMedia.format";
import { ApiError } from "../../shared/api/client";
import { describeError } from "../../shared/api/errorMessage";
import {
  getAdminMediaHead,
  type AdminMediaDeleteConflict,
  type AdminMediaHead,
  type AdminMediaKind,
  type AdminMediaObject,
  type AdminMediaUploader,
} from "./api/adminMedia.api";
import { useAdminMedia, useDeleteAdminMedia } from "./api/useAdminMedia";
import { matchesUsage, type AdminMediaUsage } from "./adminMediaUsage";
import styles from "./AdminMediaPage.module.css";

/**
 * Admin-only console listing every object actually stored in the platform's
 * upload bucket (raw `ListObjectsV2`, not a referenced-in-DB view) — for
 * security review: per-object owner, storage metadata, raw presigned URL, and
 * an on-demand real-content-type check (a `.png` key whose stored
 * `Content-Type` is actually `text/html`). Live only: `useAdminMedia` disables
 * its query in demo mode and this page renders a disabled empty state instead.
 */
export function AdminMediaPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [kind, setKind] = useState<AdminMediaKind>("all");
  const [usage, setUsage] = useState<AdminMediaUsage>("all");
  const [uploaderFilter, setUploaderFilter] =
    useState<AdminMediaUploader | null>(null);
  const [openObject, setOpenObject] = useState<AdminMediaObject | null>(null);
  const {
    objects,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isDemo,
    degraded,
  } = useAdminMedia({ kind, uploaderId: uploaderFilter?.id });

  const visibleObjects = objects.filter((object) =>
    matchesUsage(object, usage),
  );

  // The usage filter hides every object loaded so far and the bucket has more
  // pages: keep scanning rather than reporting "none" from a partial list. A
  // page fetch that failed leaves `hasNextPage` true, so `isFetchNextPageError`
  // stops the scan instead of letting it retry the same request forever; the
  // empty state then offers the load-more button as a manual retry.
  const isScanningForMatches =
    usage !== "all" &&
    !isLoading &&
    !isFetchNextPageError &&
    visibleObjects.length === 0 &&
    hasNextPage === true;

  useEffect(() => {
    if (!isScanningForMatches || isFetchingNextPage) return;
    void fetchNextPage();
  }, [isScanningForMatches, isFetchingNextPage, fetchNextPage]);

  // The filter hid everything loaded, the scan stopped, and the bucket still
  // has pages: "nothing unused" would be a claim the console can't make.
  const isUsageScanIncomplete =
    usage !== "all" && !isScanningForMatches && hasNextPage === true;

  async function copyToClipboard(value: string, confirmationLabel: string) {
    await navigator.clipboard.writeText(value);
    showToast(confirmationLabel);
  }

  return (
    <AdminShell
      title={
        <Translation i18nKey="admin:media.title" components={{ em: <em /> }} />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:media.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:media.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:media.header.sub")}
        />
      </FadeIn>

      <AdminMediaFilters
        kind={kind}
        onKindChange={setKind}
        usage={usage}
        onUsageChange={setUsage}
        uploaderFilter={uploaderFilter}
        onUploaderFilterChange={setUploaderFilter}
      />

      {!isDemo && degraded && (
        <p className={styles.degradedBanner} role="status">
          <FiAlertTriangle aria-hidden />
          {t("admin:media.references.degradedBanner")}
        </p>
      )}

      {isDemo ? (
        <EmptyState
          icon={<FiSearch />}
          title={t("admin:media.demo.title")}
          description={t("admin:media.demo.body")}
        />
      ) : isLoading ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 8 }).map((_, skeletonIndex) => (
            <SkeletonLine key={skeletonIndex} height={160} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<FiX />}
          title={t("common:error.title")}
          description={t("common:error.description")}
          action={{
            label: t("common:error.retry"),
            onClick: () => void refetch(),
          }}
        />
      ) : isScanningForMatches ? (
        <>
          <p className={styles.scanNote} role="status">
            {t("admin:media.usage.scanning", { count: objects.length })}
          </p>
          <div className={styles.grid} aria-busy="true">
            {Array.from({ length: 4 }).map((_, skeletonIndex) => (
              <SkeletonLine key={skeletonIndex} height={160} />
            ))}
          </div>
        </>
      ) : visibleObjects.length === 0 ? (
        // Three different "nothing here" answers, and only one of them is
        // final. With pages left unscanned the honest answer is "no match in
        // what's loaded", with the load-more button as the way to keep going
        // (and as the manual retry after a failed page fetch).
        isUsageScanIncomplete ? (
          <EmptyState
            icon={<FiSearch />}
            title={t("admin:media.usage.noMatchYet")}
            description={t("admin:media.usage.scannedNote", {
              count: objects.length,
            })}
            action={{
              label: t("admin:media.loadMore"),
              onClick: () => void fetchNextPage(),
            }}
          />
        ) : (
          <EmptyState
            icon={<FiSearch />}
            title={
              usage === "all"
                ? t("admin:media.empty.title")
                : t(`admin:media.usage.empty.${usage}.title`)
            }
            description={
              usage !== "all"
                ? t(`admin:media.usage.empty.${usage}.body`)
                : uploaderFilter
                  ? t("admin:media.filterByUploader.emptyForUser", {
                      name: uploaderFilter.displayName,
                    })
                  : t("admin:media.empty.body")
            }
          />
        )
      ) : (
        <>
          <div className={styles.grid}>
            {visibleObjects.map((object) => (
              <AdminMediaCard
                key={object.key}
                object={object}
                onOpen={setOpenObject}
                onFilterByUploader={setUploaderFilter}
              />
            ))}
          </div>
          {hasNextPage && (
            <div className={styles.loadMore}>
              {usage !== "all" && (
                <p className={styles.scanNote}>
                  {t("admin:media.usage.scannedNote", {
                    count: objects.length,
                  })}
                </p>
              )}
              <Button
                variant="ghost"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage
                  ? t("shared:loading.label")
                  : t("admin:media.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}

      {openObject && (
        <AdminMediaDrawer
          object={openObject}
          degraded={degraded}
          onClose={() => setOpenObject(null)}
          onCopy={copyToClipboard}
          onFilterByUploader={(uploader) => {
            setUploaderFilter(uploader);
            setOpenObject(null);
          }}
        />
      )}
    </AdminShell>
  );
}

/** Per-object inspection drawer: file URL, presigned URL, raw key, uploader,
 *  and an on-demand real-content-type check. */
function AdminMediaDrawer({
  object,
  degraded,
  onClose,
  onCopy,
  onFilterByUploader,
}: {
  object: AdminMediaObject;
  degraded: boolean;
  onClose: () => void;
  onCopy: (value: string, confirmationLabel: string) => Promise<void>;
  onFilterByUploader: (uploader: AdminMediaUploader) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [head, setHead] = useState<AdminMediaHead | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteRefusal, setDeleteRefusal] =
    useState<AdminMediaDeleteRefusal | null>(null);
  const deleteMedia = useDeleteAdminMedia();
  const uploader = object.uploader;

  async function inspectRealContentType() {
    setIsChecking(true);
    try {
      setHead(await getAdminMediaHead(object.key));
    } finally {
      setIsChecking(false);
    }
  }

  /**
   * The route refuses by default: `409` when the key is still referenced (the
   * body lists where) and `503` when the check could not run. Neither is a
   * generic failure, so instead of a toast the modal switches to the server's
   * own answer and an explicit "delete anyway" second click.
   */
  function confirmDelete(isForced: boolean) {
    deleteMedia.mutate(
      { key: object.key, isForced },
      {
        onSuccess: () => {
          showToast(t("admin:media.delete.success"));
          setDeleteRefusal(null);
          setIsConfirmingDelete(false);
          onClose();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            const conflict = error.data as AdminMediaDeleteConflict | null;
            setDeleteRefusal({
              references: conflict?.references ?? [],
              isUnverified: false,
            });
            return;
          }
          if (error instanceof ApiError && error.status === 503) {
            setDeleteRefusal({ references: [], isUnverified: true });
            return;
          }
          showToast(
            describeError(
              t("admin:errors.deleteMediaObject"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          );
        },
      },
    );
  }

  const declaredContentType = object.contentType ?? t("admin:media.unknown");
  const realContentType = head?.contentType ?? null;
  const contentTypeMismatch =
    realContentType !== null && realContentType !== object.contentType;

  return (
    <>
      <AdminDrawer
        label={t("admin:media.drawer.ariaLabel")}
        onClose={onClose}
        head={
          <img
            className={styles.drawerImage}
            src={absoluteFileUrl(object.fileUrl)}
            alt=""
          />
        }
        foot={
          <div className={styles.actions}>
            <a
              className={styles.actionLink}
              href={absoluteFileUrl(object.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiExternalLink aria-hidden /> {t("admin:media.openFile")}
            </a>
            <Button
              variant="ghost"
              onClick={() =>
                void onCopy(
                  object.presignedUrl,
                  t("admin:media.copiedPresigned"),
                )
              }
            >
              <FiCopy aria-hidden /> {t("admin:media.copyPresigned")}
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                void onCopy(object.key, t("admin:media.copiedKey"))
              }
            >
              <FiCopy aria-hidden /> {t("admin:media.copyKey")}
            </Button>
            {uploader && (
              <Button
                variant="ghost"
                onClick={() => onFilterByUploader(uploader)}
              >
                <FiUser aria-hidden />{" "}
                {t("admin:media.filterByUploader.showAll")}
              </Button>
            )}
            <Button
              variant="ghost"
              disabled={isChecking}
              onClick={() => void inspectRealContentType()}
            >
              {isChecking
                ? t("shared:loading.label")
                : t("admin:media.inspectRealType")}
            </Button>
            <Button
              variant="danger"
              disabled={deleteMedia.isPending}
              onClick={() => setIsConfirmingDelete(true)}
            >
              <FiTrash2 aria-hidden /> {t("admin:media.deleteFile")}
            </Button>
          </div>
        }
      >
        <DetailRows
          rows={[
            { label: t("admin:media.field.key"), value: object.key },
            {
              label: t("admin:media.field.uploader"),
              value: object.uploader
                ? `${object.uploader.displayName} · @${object.uploader.handle}`
                : t("admin:media.unowned"),
            },
            {
              label: t("admin:media.field.declaredType"),
              value: declaredContentType,
            },
            ...(realContentType !== null
              ? [
                  {
                    label: t("admin:media.field.realType"),
                    value: (
                      <span
                        className={
                          contentTypeMismatch ? styles.mismatch : undefined
                        }
                      >
                        {realContentType}
                        {contentTypeMismatch
                          ? ` · ${t("admin:media.spoofWarning")}`
                          : ""}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
        <section className={styles.referencesSection}>
          <h3 className={styles.referencesHeading}>
            {t("admin:media.references.heading")}
          </h3>
          <AdminMediaReferenceList
            references={object.references}
            degraded={degraded}
          />
        </section>
      </AdminDrawer>
      {isConfirmingDelete && (
        <AdminMediaDeleteConfirm
          references={object.references}
          degraded={degraded}
          isPending={deleteMedia.isPending}
          refusal={deleteRefusal}
          onCancel={() => {
            setDeleteRefusal(null);
            setIsConfirmingDelete(false);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
