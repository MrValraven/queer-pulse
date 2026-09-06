import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useSubprofiles } from "./api/useSubprofiles";
import type { SubprofileKind } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  isValidSubprofileKind,
  MAX_SUBPROFILES,
  toPublicView,
} from "./mySubprofiles.data";
import { OwnerSideCard, type PersonaShareTarget } from "./OwnerSideCard";
import { SubprofileDeleteModal } from "./SubprofileDeleteModal";
import { NewSideModal } from "./NewSideModal";
import { PersonaInvitesBanner } from "./PersonaInvitesBanner";
import {
  LoadingSides,
  EmptySides,
  ErrorSides,
} from "./SubprofileDashboardStates";
// The global `.sides`/`.side`/`.empty-hero`/`.new-side` dashboard styles.
// Imported here (a lazy owner-only route) rather than globally so they ride
// this route's chunk instead of the app-wide bundle.
import "./persona-dashboard.css";
import styles from "./MySubprofilesPage.module.css";

// The share card pulls the `qrcode` library into its module — lazy-load it so
// that weight lands in its own chunk fetched only when a member opens Share,
// never in the dashboard's initial payload.
const SubprofileShareCard = lazy(() => import("./SubprofileShareCard"));

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
  const { data: subprofiles, isLoading, isError, refetch } = useSubprofiles();
  const [creating, setCreating] = useState(false);
  const [createKind, setCreateKind] = useState<SubprofileKind | null>(null);
  const [shareTarget, setShareTarget] = useState<PersonaShareTarget | null>(
    null,
  );
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

  const list = subprofiles ?? [];
  const atCap = list.length >= MAX_SUBPROFILES;

  // Every "+ New" affordance funnels through here so a stale `createKind` from
  // an earlier deep-link never leaks into a later, unrelated manual open.
  function openCreate(kind: SubprofileKind | null = null) {
    setCreateKind(kind);
    setCreating(true);
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
              {t("subprofiles:mine.count", {
                n: list.length,
                max: MAX_SUBPROFILES,
              })}
            </span>
            <Button
              variant="primary"
              onClick={() => openCreate()}
              disabled={atCap}
            >
              <FiPlus size={16} aria-hidden /> {t("subprofiles:mine.newCta")}
            </Button>
            {atCap && (
              <p className={styles.atCapNote}>{t("subprofiles:mine.atCap")}</p>
            )}
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
              <OwnerSideCard
                key={subprofile.id}
                view={subprofile}
                onShare={setShareTarget}
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
        // No fallback: the modal chunk is tiny and the trigger is a deliberate
        // click, so a brief nothing beats flashing a spinner over the page.
        <Suspense fallback={null}>
          <SubprofileShareCard
            view={toPublicView(shareTarget.view)}
            shareUrl={shareTarget.shareUrl}
            onClose={() => setShareTarget(null)}
          />
        </Suspense>
      )}

      {deleteTarget && (
        <SubprofileDeleteModal
          subprofile={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AppShell>
  );
}
