import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { routes, subprofileEditPath } from "../../app/routeMap";
import { useSubprofiles } from "./api/useSubprofiles";
import { useSubprofileMembers } from "./api/useSubprofileMembers";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import type { SubprofileKind } from "./api/subprofiles.api";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaPublicPathForOwner } from "./personaLinks.data";
import { SideCard } from "./SideCard";
import { SubprofileShareCard } from "./SubprofileShareCard";
import { NewSideModal } from "./NewSideModal";
import { PersonaInvitesBanner } from "./PersonaInvitesBanner";
import { LoadingSides, EmptySides, ErrorSides } from "./SubprofileDashboardStates";
import styles from "./MySubprofilesPage.module.css";

const MAX_SUBPROFILES = 12;

const VALID_KINDS = new Set<string>(Object.keys(KIND_LABEL_KEYS));

/** Narrow a raw `?kind=` query value to a real `SubprofileKind`, or `null` if
 *  it's missing/unrecognized — never trust a URL param as-is. */
function isValidSubprofileKind(value: string | null): value is SubprofileKind {
  return value !== null && VALID_KINDS.has(value);
}

/** Adapt an owner-dashboard row (`SubprofileView`, no owner-tie/social-proof
 *  fields — every row is implicitly owned by the signed-in member) into the
 *  `PublicSubprofileView` shape `SubprofileShareCard` reads, so the share
 *  card is a single implementation shared by the public hero and this page.
 *  Mirrors `personaPublicPathForOwner`'s linked-vs-standalone `ownerSlug`
 *  rule; the owner-viewing-their-own-card social-proof fields don't apply
 *  here, so they default to `false`. */
function toPublicView(
  subprofile: SubprofileView,
  ownerSlug: string,
): PublicSubprofileView {
  return {
    ...subprofile,
    ownerSlug: subprofile.linkVisibility === "linked" ? ownerSlug : undefined,
    ownerName: undefined,
    viewerEndorsed: false,
    viewerFollowing: false,
    // The signed-in owner is trivially a member of their own persona.
    viewerIsMember: true,
  };
}

/**
 * Owner dashboard: every persona this member runs, as a `.sides` card grid
 * (`SideCard`, readiness ring on drafts / status pill on published), a
 * trailing dashed "new persona" tile, the compact co-owner invite banner, a
 * create flow, and per-card share / edit / delete. Wrapped in `AppShell`
 * (logged-in).
 */
export function MySubprofilesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfileData();
  const { data: subprofiles, isLoading, isError, refetch } = useSubprofiles();
  const { remove } = useSubprofileMutations();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [createKind, setCreateKind] = useState<SubprofileKind | null>(null);
  const [shareTarget, setShareTarget] = useState<SubprofileView | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubprofileView | null>(null);

  // Persona-creation deep-link (Moment 4's onboarding "set one up" + a picked
  // craft): `?create=1[&kind=]` opens the create modal on mount, pre-selecting
  // the craft when the param is a real `SubprofileKind`. One-shot — the params
  // are cleared via history replace right after so a refresh (or reopening the
  // modal manually later) never re-triggers it, mirroring the `?c=` deep-link
  // pattern in `useMessageCreation.ts`.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    const rawKind = searchParams.get("kind");
    openCreate(isValidSubprofileKind(rawKind) ? rawKind : null);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);
  // Co-owner count for the persona pending deletion — reuses the "manage
  // co-owners" hook rather than a new backend field (`enabled` gates it off
  // whenever no delete is in flight). Deleting removes the persona for every
  // co-owner, not just the signed-in one, so a shared persona gets a
  // stronger warning than a solo one.
  const { data: deleteTargetMembers } = useSubprofileMembers(deleteTarget?.id);
  const coOwnerCount = deleteTargetMembers?.length ?? 0;
  const isSharedDelete = coOwnerCount > 1;

  const list = subprofiles ?? [];
  const atCap = list.length >= MAX_SUBPROFILES;

  // Every "+ New" affordance funnels through here so a stale `createKind` from
  // an earlier deep-link never leaks into a later, unrelated manual open.
  function openCreate(kind: SubprofileKind | null = null) {
    setCreateKind(kind);
    setCreating(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.displayName || t("subprofiles:mine.defaultName");
    try {
      await remove.mutateAsync(deleteTarget.id);
      showToast(t("subprofiles:mine.toastDeleted", { name }), "info");
    } catch {
      showToast(t("subprofiles:mine.toastDeleteError"), "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <AppShell>
      <div className={`wrap ${styles.dashboardContainer}`}>
        <div className="page-head">
          <div className={styles.headText}>
            <h1>
              <Translation
                i18nKey="subprofiles:mine.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p>{t("subprofiles:mine.sub")}</p>
          </div>
          <div className={styles.headActions}>
            <span className={styles.count}>
              {t("subprofiles:mine.count", { n: list.length, max: MAX_SUBPROFILES })}
            </span>
            <Button
              variant="primary"
              onClick={() => openCreate()}
              disabled={atCap}
            >
              <FiPlus size={16} aria-hidden /> {t("subprofiles:mine.newCta")}
            </Button>
            {atCap && <p className={styles.atCapNote}>{t("subprofiles:mine.atCap")}</p>}
          </div>
        </div>

        <PersonaInvitesBanner />

        {isLoading ? (
          <LoadingSides />
        ) : isError ? (
          <ErrorSides onRetry={() => void refetch()} />
        ) : list.length === 0 ? (
          <EmptySides
            onNew={() => openCreate()}
            onBrowse={() => void navigate(routes.subprofiles)}
          />
        ) : (
          <div className="sides">
            {list.map((subprofile) => (
              <SideCard
                key={subprofile.id}
                view={subprofile}
                onOpen={() =>
                  void navigate(personaPublicPathForOwner(subprofile, profile.slug))
                }
                onEdit={() => void navigate(subprofileEditPath(subprofile.id))}
                onShare={() => setShareTarget(subprofile)}
                onDelete={() => setDeleteTarget(subprofile)}
              />
            ))}
            {!atCap && (
              <button
                type="button"
                className="new-side"
                onClick={() => openCreate()}
              >
                <FiPlus size={22} aria-hidden />
                <b>{t("subprofiles:mine.newSideTile")}</b>
              </button>
            )}
          </div>
        )}
      </div>

      {creating && (
        <NewSideModal
          initialKind={createKind}
          onClose={() => setCreating(false)}
        />
      )}

      {shareTarget && (
        <SubprofileShareCard
          view={toPublicView(shareTarget, profile.slug)}
          onClose={() => setShareTarget(null)}
        />
      )}

      {deleteTarget && (
        <Modal
          title={t("subprofiles:mine.deleteModalTitle")}
          sub={t("subprofiles:mine.deleteModalSub", {
            name:
              deleteTarget.displayName ||
              t("subprofiles:mine.deleteModalDefaultName"),
          })}
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                {t("subprofiles:mine.deleteModalKeep")}
              </Button>
              <Button
                variant="danger"
                onClick={() => void confirmDelete()}
                disabled={remove.isPending}
              >
                {remove.isPending
                  ? t("subprofiles:mine.deleteModalDeleting")
                  : t("subprofiles:mine.deleteModalConfirm")}
              </Button>
            </>
          }
        >
          <p>
            {isSharedDelete
              ? t("subprofiles:mine.deleteModalBodyShared", {
                  name:
                    deleteTarget.displayName ||
                    t("subprofiles:mine.deleteModalDefaultName"),
                  n: coOwnerCount,
                })
              : t("subprofiles:mine.deleteModalBody")}
          </p>
        </Modal>
      )}
    </AppShell>
  );
}
