import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminDrawer, AdminPageHeader } from "./ui";
import { AdminMediaDeleteConfirm } from "./AdminMediaDeleteConfirm";
import { AdminMediaDrawerActions } from "./AdminMediaDrawerActions";
import { AdminMediaDrawerMeta } from "./AdminMediaDrawerMeta";
import { AdminMediaFilters } from "./AdminMediaFilters";
import { AdminMediaGrid } from "./AdminMediaGrid";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { absoluteFileUrl } from "./adminMedia.format";
import {
  getAdminMediaHead,
  type AdminMediaHead,
  type AdminMediaKind,
  type AdminMediaObject,
  type AdminMediaUploader,
} from "./api/adminMedia.api";
import { useAdminMedia } from "./api/useAdminMedia";
import { useAdminMediaDrawerDelete } from "./useAdminMediaDrawerDelete";
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

      <AdminMediaGrid
        isDemo={isDemo}
        isLoading={isLoading}
        isError={isError}
        isScanningForMatches={isScanningForMatches}
        isUsageScanIncomplete={isUsageScanIncomplete}
        objects={objects}
        visibleObjects={visibleObjects}
        usage={usage}
        uploaderFilter={uploaderFilter}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        onRefetch={() => void refetch()}
        onFetchNextPage={() => void fetchNextPage()}
        onOpen={setOpenObject}
        onFilterByUploader={setUploaderFilter}
      />

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
  const [head, setHead] = useState<AdminMediaHead | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const uploader = object.uploader;
  const {
    isConfirmingDelete,
    openConfirm,
    deleteRefusal,
    cancelConfirm,
    isDeletePending,
    confirmDelete,
  } = useAdminMediaDrawerDelete({ objectKey: object.key, onDeleted: onClose });

  async function inspectRealContentType() {
    setIsChecking(true);
    try {
      setHead(await getAdminMediaHead(object.key));
    } finally {
      setIsChecking(false);
    }
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
          <AdminMediaDrawerActions
            object={object}
            uploader={uploader}
            isChecking={isChecking}
            onInspectRealContentType={() => void inspectRealContentType()}
            onCopy={onCopy}
            onFilterByUploader={onFilterByUploader}
            isDeletePending={isDeletePending}
            onRequestDelete={openConfirm}
          />
        }
      >
        <AdminMediaDrawerMeta
          object={object}
          degraded={degraded}
          declaredContentType={declaredContentType}
          realContentType={realContentType}
          contentTypeMismatch={contentTypeMismatch}
        />
      </AdminDrawer>
      {isConfirmingDelete && (
        <AdminMediaDeleteConfirm
          references={object.references}
          degraded={degraded}
          isPending={isDeletePending}
          refusal={deleteRefusal}
          onCancel={cancelConfirm}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
