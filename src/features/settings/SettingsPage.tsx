import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useProfileTheme } from "../../app/providers/ProfileThemeProvider";
import { useScrollLock } from "../../shared/hooks";
import { AppShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { NAV, type PaneId } from "./settings.data";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { EditProfilePane } from "./EditProfilePane";
import { ProfileThemePane, AccessibilityPane } from "./SettingsPersonalisation";
import { InterestsPane } from "./InterestsPane";
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
  useScrollLock(showDelete);

  // Drop any leftover unsaved theme edits when re-entering Settings.
  useEffect(() => {
    discardTheme();
  }, [discardTheme]);

  // Open a profile edit session once when a profile-editing pane is active and
  // none is already open. Track that WE opened it, so we only ever tear down our
  // own session — never one the members profile page opened.
  useEffect(() => {
    if (
      (pane === "profile" || pane === "visibility") &&
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
      if (openedRef.current) cancelEditing();
    },
    [cancelEditing],
  );

  const markChanged = () => setDirty(true);

  return (
    <AppShell>
      <div className={`wrap ${styles.page}`}>
        <aside className={styles.sidebar}>
          {NAV.map((g) => (
            <div key={g.group}>
              <h3>{g.group}</h3>
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
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className={styles.main}>
          <FadeIn key={pane}>
            {pane === "notifications" && (
              <NotificationsPane onChange={markChanged} />
            )}
            {pane === "language" && <LanguagePane onChange={markChanged} />}
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
            {pane === "simulations" && <SimulationsPane />}
            {pane === "delete" && <DeleteAccountSection />}
          </FadeIn>
        </main>
      </div>

      {dirty && (
        <div className={styles.saveBar}>
          <p>{saveError ?? "You have unsaved changes."}</p>
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
              Discard
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
                      "We couldn't save your changes. Please try again.",
                      "error",
                    );
                    return;
                  }
                }
                commitTheme();
                setDirty(false);
                showToast("Settings saved", "success");
              }}
            >
              Save changes
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
