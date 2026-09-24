import { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useScrollLock } from "../../shared/hooks";
import { AppShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NAV, type PaneId } from "./settings.data";
import { BlockedUsersPane } from "./BlockedUsersPane";
import { DeleteAccountSection } from "./DeleteAccountSection";
import type { DeleteOption } from "./deleteAccount.data";
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
import { useSettingsEditSession } from "./useSettingsEditSession";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const initialPane = (() => {
    const p = params.get("pane");
    const valid = NAV.flatMap((g) => g.items.map((i) => i.id));
    return p && valid.includes(p as PaneId) ? (p as PaneId) : "notifications";
  })();
  const [pane, setPane] = useState<PaneId>(initialPane);
  const [showDelete, setShowDelete] = useState(false);
  // Which off-ramp the member asked for on the way into the "delete" pane, so
  // "Pause my account" and "Delete permanently" both land on the option they
  // named. PRD-09: the Data pane's danger zone hands off here rather than
  // running a second copy of the confirm-and-step-up flow.
  const [lifecycleOption, setLifecycleOption] =
    useState<DeleteOption>("deactivate");
  const sidebarRef = useRef<HTMLElement>(null);
  useScrollLock(showDelete);
  // Dirty tracking, the profile edit session, the one save routine shared by
  // the save bar and the leave dialog's "Save and leave", and the leave guard.
  const {
    isDirty,
    changedKeys,
    markChanged,
    discardChanges,
    saveChanges,
    isSaving,
    saveError,
  } = useSettingsEditSession({ pane, isDeleteModalOpen: showDelete });

  // On the mobile horizontal nav strip, keep the selected tab in view when the
  // pane changes (a pane can be picked from off-screen, e.g. the delete modal).
  useEffect(() => {
    const active = sidebarRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pane]);

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
            {pane === "notifications" && <NotificationsPane />}
            {pane === "language" && <LanguagePane />}
            {pane === "data" && (
              <DataPane
                onChange={markChanged}
                onPauseClick={() => {
                  setLifecycleOption("deactivate");
                  setPane("delete");
                }}
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
            {pane === "account" && <AccountPane />}
            {pane === "uploads" && <MyUploadsPane />}
            {pane === "delete" && (
              <DeleteAccountSection
                initialOption={lifecycleOption}
                onOpenNotificationSettings={() => setPane("notifications")}
              />
            )}
          </FadeIn>
        </div>
      </div>

      {isDirty && (
        <SettingsSaveBar
          changedKeys={changedKeys}
          saveError={saveError}
          isSaving={isSaving}
          onDiscard={discardChanges}
          onSave={() => void saveChanges()}
        />
      )}

      {showDelete && (
        <DeleteAccountModal
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            // Funnel to the real, re-auth-gated deletion flow rather than
            // firing a fake "we emailed you" toast that nothing backs.
            setShowDelete(false);
            setLifecycleOption("delete");
            setPane("delete");
          }}
        />
      )}
    </AppShell>
  );
}
