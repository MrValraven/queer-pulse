import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useProfileTheme } from "../../app/providers/ProfileThemeProvider";
import { useScrollLock } from "../../shared/hooks";
import { AppShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NAV, type PaneId } from "./settings.data";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { EditProfilePane } from "./EditProfilePane";
import { ProfileThemePane, AccessibilityPane } from "./SettingsPersonalisation";
import { InterestsPane } from "./InterestsPane";
import { SafetyPane } from "./SafetyPane";
import { DeleteAccountModal } from "./SettingsControls";
import {
  AccountPane,
  DataPane,
  LanguagePane,
  NotificationsPane,
  SimulationsPane,
  VisibilityPane,
} from "./SettingsPanes";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { commit: commitTheme, discard: discardTheme } = useProfileTheme();
  const { save, cancelEditing, startEditing, isSaving, saveError, isEditing } =
    useProfile();
  const [params] = useSearchParams();
  const initialPane = (() => {
    const p = params.get("pane");
    const valid = NAV.flatMap((g) => g.items.map((i) => i.id));
    return p && valid.includes(p as PaneId) ? (p as PaneId) : "notifications";
  })();
  const [pane, setPane] = useState<PaneId>(initialPane);
  const [dirty, setDirty] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
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

  const markChanged = () => setDirty(true);

  return (
    <AppShell>
      <div className={`wrap ${styles.page}`}>
        <aside className={styles.sidebar}>
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
              <ProfileThemePane onChange={markChanged} />
            )}
            {pane === "accessibility" && (
              <AccessibilityPane onChange={markChanged} />
            )}
            {pane === "interests" && <InterestsPane onChange={markChanged} />}
            {pane === "account" && <AccountPane onChange={markChanged} />}
            {pane === "safety" && <SafetyPane />}
            {pane === "simulations" && <SimulationsPane />}
            {pane === "delete" && <DeleteAccountSection />}
          </FadeIn>
        </div>
      </div>

      {dirty && (
        <div className={styles.saveBar}>
          <p>{saveError ?? t("settings:page.saveBar.unsaved")}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className={styles.discard}
              onClick={() => {
                if (openedRef.current) {
                  cancelEditing();
                  openedRef.current = false;
                }
                discardTheme();
                setDirty(false);
              }}
            >
              {t("settings:page.saveBar.discard")}
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              disabled={isSaving}
              onClick={async () => {
                if (openedRef.current) {
                  const ok = await save();
                  if (!ok) {
                    showToast(
                      t("settings:page.saveBar.saveErrorToast"),
                      "error",
                    );
                    return;
                  }
                }
                commitTheme();
                setDirty(false);
                showToast(t("settings:page.saveBar.savedToast"), "success");
              }}
            >
              {t("settings:page.saveBar.save")}
            </button>
          </div>
        </div>
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
