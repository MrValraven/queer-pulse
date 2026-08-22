import { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useProfileTheme } from "../../app/providers/useProfileTheme";
import { routes } from "../../app/routeMap";
import { useScrollLock, useUnsavedChangesGuard } from "../../shared/hooks";
import { AppShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NAV, type PaneId } from "./settings.data";
import { BlockedUsersPane } from "./BlockedUsersPane";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { EditProfilePane } from "./EditProfilePane";
import { MyUploadsPane } from "./MyUploadsPane";
import { ProfileThemePane, AccessibilityPane } from "./SettingsPersonalisation";
import { InterestsPane } from "./InterestsPane";
import { DeleteAccountModal } from "./SettingsControls";
import { SettingsSaveBar } from "./SettingsSaveBar";
import {
  AccountPane,
  DataPane,
  LanguagePane,
  NotificationsPane,
  VisibilityPane,
} from "./SettingsPanes";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { commit: commitTheme, discard: discardTheme } = useProfileTheme();
  const { save, cancelEditing, startEditing, isSaving, saveError, isEditing } =
    useProfileEdit();
  const [params] = useSearchParams();
  const initialPane = (() => {
    const p = params.get("pane");
    const valid = NAV.flatMap((g) => g.items.map((i) => i.id));
    return p && valid.includes(p as PaneId) ? (p as PaneId) : "notifications";
  })();
  const [pane, setPane] = useState<PaneId>(initialPane);
  const [dirty, setDirty] = useState(false);
  // Which fields changed, in the order they were touched — feeds the save
  // bar's "what changed" disclosure. Only panes backed by real persisted
  // state (profile draft, theme draft) pass a key; cosmetic/coming-soon
  // controls elsewhere still mark the page dirty but report nothing here.
  const [changedKeys, setChangedKeys] = useState<string[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const openedRef = useRef(false);
  const cancelEditingRef = useRef(cancelEditing);
  useScrollLock(showDelete);

  // Keep the ref current after every render (outside render, so this is safe),
  // so the unmount-only cleanup below always calls the latest cancelEditing
  // without needing to depend on it (its identity changes on every save).
  useEffect(() => {
    cancelEditingRef.current = cancelEditing;
  });

  // Drop any leftover unsaved theme edits when re-entering Settings.
  useEffect(() => {
    discardTheme();
  }, [discardTheme]);

  // On the mobile horizontal nav strip, keep the selected tab in view when the
  // pane changes (a pane can be picked from off-screen, e.g. the delete modal).
  useEffect(() => {
    const active = sidebarRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pane]);

  // Open a profile edit session once when a profile-editing pane is active and
  // none is already open. Track that WE opened it, so we only ever tear down our
  // own session — never one the members profile page opened.
  useEffect(() => {
    if (
      (pane === "profile" || pane === "visibility" || pane === "interests") &&
      !isEditing &&
      !openedRef.current
    ) {
      startEditing();
      openedRef.current = true;
    }
  }, [pane, isEditing, startEditing]);

  // Leaving Settings drops an edit session WE opened (mirrors Discard). A session
  // opened elsewhere is left intact.
  useEffect(
    () => () => {
      if (openedRef.current) cancelEditingRef.current();
    },
    [],
  );

  const markChanged = (key?: string) => {
    setDirty(true);
    if (key) {
      setChangedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    }
  };

  // Warn before a dirty Settings pane is abandoned — in-app navigation and hard
  // tab-close both prompt. Previously the save bar was the only signal and a
  // click into any other page silently discarded the edits. On confirmed leave,
  // roll back the same way Discard does so no half-open edit session lingers.
  useUnsavedChangesGuard({
    active: dirty && !showDelete,
    confirmMessage: t("settings:page.leaveConfirm"),
    onConfirmLeave: () => {
      if (openedRef.current) {
        cancelEditing();
        openedRef.current = false;
      }
      discardTheme();
      setDirty(false);
      setChangedKeys([]);
    },
  });

  // The "Flow simulations" settings pane is retired in favour of the
  // dedicated /simulations sandbox (dev-only). A stray `?pane=simulations`
  // link (bookmarked or shared before the move) redirects there instead of
  // rendering a removed pane. Dev-safe: /simulations itself is a no-op route
  // in production (see features/simulations/routes.tsx), so this never opens
  // anything in a shipped build.
  if (params.get("pane") === "simulations") {
    return <Navigate to={routes.simulations} replace />;
  }

  return (
    <AppShell>
      <div className={`wrap ${styles.page}`}>
        <aside className={styles.sidebar} ref={sidebarRef}>
          {NAV.map((g) => (
            <div key={g.groupKey}>
              <h3>{t(g.groupKey)}</h3>
              {g.items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={[
                    styles.navItem,
                    item.danger && styles.navItemDanger,
                    pane === item.id && styles.navItemActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={pane === item.id ? "page" : undefined}
                  onClick={() => setPane(item.id)}
                >
                  <span className={styles.icon}>
                    <item.icon />
                  </span>
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className={styles.main}>
          <FadeIn key={pane}>
            {pane === "notifications" && (
              <NotificationsPane onChange={markChanged} />
            )}
            {pane === "language" && <LanguagePane />}
            {pane === "data" && (
              <DataPane
                onChange={markChanged}
                onDeleteClick={() => setShowDelete(true)}
              />
            )}
            {pane === "visibility" && <VisibilityPane onChange={markChanged} />}
            {pane === "profile" && <EditProfilePane onChange={markChanged} />}
            {pane === "profile-theme" && (
              <ProfileThemePane
                onChange={() => markChanged("theme.appearance")}
              />
            )}
            {/* Accessibility preferences save the moment they are flipped, so
                the pane deliberately never marks the page dirty. */}
            {pane === "accessibility" && <AccessibilityPane />}
            {pane === "interests" && <InterestsPane onChange={markChanged} />}
            {pane === "blockedUsers" && <BlockedUsersPane />}
            {pane === "account" && <AccountPane onChange={markChanged} />}
            {pane === "uploads" && <MyUploadsPane />}
            {pane === "delete" && <DeleteAccountSection />}
          </FadeIn>
        </div>
      </div>

      {dirty && (
        <SettingsSaveBar
          changedKeys={changedKeys}
          saveError={saveError}
          isSaving={isSaving}
          onDiscard={() => {
            if (openedRef.current) {
              cancelEditing();
              openedRef.current = false;
            }
            discardTheme();
            setDirty(false);
            setChangedKeys([]);
          }}
          onSave={() =>
            void (async () => {
              if (openedRef.current) {
                const ok = await save();
                if (!ok) {
                  showToast(t("settings:page.saveBar.saveErrorToast"), "error");
                  return;
                }
              }
              commitTheme();
              setDirty(false);
              setChangedKeys([]);
              showToast(t("settings:page.saveBar.savedToast"), "success");
            })()
          }
        />
      )}

      {showDelete && (
        <DeleteAccountModal
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            // Funnel to the real, re-auth-gated deletion flow rather than
            // firing a fake "we emailed you" toast that nothing backs.
            setShowDelete(false);
            setPane("delete");
          }}
        />
      )}
    </AppShell>
  );
}
