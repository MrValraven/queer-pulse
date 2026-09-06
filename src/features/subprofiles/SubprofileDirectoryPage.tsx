import { useSearchParams } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { FeatureHelp } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FollowedPersonasPanel } from "./FollowedPersonasPanel";
import { SubprofileDirectoryBrowse } from "./SubprofileDirectoryBrowse";
import {
  SubprofileDirectoryTabs,
  type SubprofileDirectoryView,
} from "./SubprofileDirectoryTabs";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * The persona hub, in two tabs.
 *
 * **Everyone** browses standalone (unlinked + published) personas across the
 * community, filterable by profession, tag, free-text search and
 * open-to-collabs. That body lives in `SubprofileDirectoryBrowse`.
 *
 * **You follow** is the personal list of personas this member follows
 * (PRD-208), in `FollowedPersonasPanel`.
 *
 * WHY FOLLOWING LIVES HERE. It is a list of somebody else's personas, so it
 * does not belong on `/account/subprofiles`, which is the dashboard for the
 * personas you RUN. The hub is where personas are found, which makes the
 * empty state's "go and find some" the tab next door rather than another
 * page, and it needs no new route: `/subprofiles` is already gated to
 * signed-in members in `authGate.ts`.
 *
 * The active tab is addressed by `?view=following`, so the choice survives a
 * refresh and a shared link, and a notification or an empty state elsewhere
 * can point straight at the list. Anything else in that param reads as the
 * default browse tab rather than an error. Wrapped in `AppShell` (logged-in).
 */
export function SubprofileDirectoryPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const view: SubprofileDirectoryView =
    searchParams.get("view") === "following" ? "following" : "browse";

  // `replace` so tab switching never fills the back stack: Back should leave
  // the hub, the way it does on every other tabbed surface here.
  const setView = (next: SubprofileDirectoryView) => {
    const params = new URLSearchParams(searchParams);
    if (next === "following") {
      params.set("view", "following");
    } else {
      params.delete("view");
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>
              {t("subprofiles:directory.eyebrow")}
            </span>
            <h1 className={styles.title}>
              <Translation
                i18nKey="subprofiles:directory.title"
                components={{ em: <em /> }}
              />{" "}
              <FeatureHelp id="subprofiles.hub" />
            </h1>
            <p className={styles.sub}>{t("subprofiles:directory.subtitle")}</p>
          </header>

          <SubprofileDirectoryTabs active={view} onChange={setView} />

          <div
            className={styles.panel}
            id={`subprofile-directory-panel-${view}`}
            role="tabpanel"
            aria-labelledby={`subprofile-directory-tab-${view}`}
          >
            {view === "following" ? (
              <FollowedPersonasPanel onBrowse={() => setView("browse")} />
            ) : (
              <SubprofileDirectoryBrowse />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
