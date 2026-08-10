import { useState } from "react";
import { FiExternalLink, FiCopy, FiSearch, FiX } from "react-icons/fi";
import {
  Button,
  DetailRows,
  EmptyState,
  FadeIn,
  SegmentedControl,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminDrawer, AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { API_BASE_URL } from "../../shared/api/config";
import {
  ADMIN_MEDIA_KINDS,
  getAdminMediaHead,
  type AdminMediaHead,
  type AdminMediaKind,
  type AdminMediaObject,
} from "./api/adminMedia.api";
import { useAdminMedia } from "./api/useAdminMedia";
import styles from "./AdminMediaPage.module.css";

/** Absolute URL for a `/files/*` proxy path so `<img>`/new-tab both resolve. */
function absoluteFileUrl(fileUrl: string): string {
  return fileUrl.startsWith("http") ? fileUrl : `${API_BASE_URL}${fileUrl}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [openObject, setOpenObject] = useState<AdminMediaObject | null>(null);
  const {
    objects,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isDemo,
  } = useAdminMedia({ kind });

  async function copyToClipboard(value: string, confirmationLabel: string) {
    await navigator.clipboard.writeText(value);
    showToast(confirmationLabel);
  }

  return (
    <AdminShell
      title={<Translation i18nKey="admin:media.title" components={{ em: <em /> }} />}
      breadcrumb={[{ label: t("admin:common.adminBreadcrumb"), to: routes.admin }]}
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

      <FadeIn delay={60}>
        <SegmentedControl
          label={t("admin:media.filterAriaLabel")}
          value={kind}
          onChange={(next) => setKind(next as AdminMediaKind)}
          options={ADMIN_MEDIA_KINDS.map((kindValue) => ({
            value: kindValue,
            label: t(`admin:media.kinds.${kindValue}`),
          }))}
        />
      </FadeIn>

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
          action={{ label: t("common:error.retry"), onClick: () => void refetch() }}
        />
      ) : objects.length === 0 ? (
        <EmptyState
          icon={<FiSearch />}
          title={t("admin:media.empty.title")}
          description={t("admin:media.empty.body")}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {objects.map((object) => (
              <FadeIn key={object.key}>
                <button
                  type="button"
                  className={styles.card}
                  onClick={() => setOpenObject(object)}
                >
                  <img
                    className={styles.thumb}
                    src={absoluteFileUrl(object.fileUrl)}
                    alt=""
                    loading="lazy"
                  />
                  <span className={styles.kindBadge}>
                    {ADMIN_MEDIA_KINDS.includes(object.kind as AdminMediaKind)
                      ? t(`admin:media.kinds.${object.kind}`)
                      : object.kind}
                  </span>
                  <span className={styles.meta}>
                    {formatBytes(object.size)}
                    {" · "}
                    {object.uploader
                      ? object.uploader.displayName
                      : t("admin:media.unowned")}
                  </span>
                </button>
              </FadeIn>
            ))}
          </div>
          {hasNextPage && (
            <div className={styles.loadMore}>
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
          onClose={() => setOpenObject(null)}
          onCopy={copyToClipboard}
        />
      )}
    </AdminShell>
  );
}

/** Per-object inspection drawer: file URL, presigned URL, raw key, uploader,
 *  and an on-demand real-content-type check. */
function AdminMediaDrawer({
  object,
  onClose,
  onCopy,
}: {
  object: AdminMediaObject;
  onClose: () => void;
  onCopy: (value: string, confirmationLabel: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [head, setHead] = useState<AdminMediaHead | null>(null);
  const [isChecking, setIsChecking] = useState(false);

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
            rel="noreferrer"
          >
            <FiExternalLink aria-hidden /> {t("admin:media.openFile")}
          </a>
          <Button
            variant="ghost"
            onClick={() =>
              void onCopy(object.presignedUrl, t("admin:media.copiedPresigned"))
            }
          >
            <FiCopy aria-hidden /> {t("admin:media.copyPresigned")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void onCopy(object.key, t("admin:media.copiedKey"))}
          >
            <FiCopy aria-hidden /> {t("admin:media.copyKey")}
          </Button>
          <Button
            variant="ghost"
            disabled={isChecking}
            onClick={() => void inspectRealContentType()}
          >
            {isChecking
              ? t("shared:loading.label")
              : t("admin:media.inspectRealType")}
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
                    <span className={contentTypeMismatch ? styles.mismatch : undefined}>
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
    </AdminDrawer>
  );
}
