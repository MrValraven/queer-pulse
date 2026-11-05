import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Tabs } from "../../shared/components/ui";
import {
  FilterPageFrame,
  FilterPageHeader,
} from "../../shared/components/filterPage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { MY_HOUSING_LISTINGS_PATH } from "./housing.data";
import { HousingBoard } from "./HousingBoard";
import { HousingBoardBands, HousingBoardExtras } from "./HousingBoardExtras";
import { FlatmatesBoard, FlatmatesOutro } from "./FlatmatesBoard";
import { ListSpaceModal } from "./ListSpaceModal";
import { PostProfileModal } from "./PostProfileModal";
import styles from "./HousingPage.module.css";

export function HousingPage() {
  const { t } = useTranslation();
  const pageTitle = t("economy:housing.meta.title");
  const pageDescription = t("economy:housing.meta.description");
  const [params, setParams] = useSearchParams();
  const [isListingSpace, setIsListingSpace] = useState(false);
  const [isPostingProfile, setIsPostingProfile] = useState(false);
  const tabs = useMemo(
    () => [
      { id: "housing", label: t("economy:housing.tabs.housing") },
      { id: "flatmates", label: t("economy:housing.tabs.flatmates") },
    ],
    [t],
  );
  // Tab lives in the URL (?tab=flatmates) so the Flatmates view is deep-linkable
  // and back-button friendly; the default (no param) is the Housing board.
  const active = params.get("tab") === "flatmates" ? "flatmates" : "housing";
  const isFlatmatesTab = active === "flatmates";

  const setActive = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === "flatmates") next.set("tab", "flatmates");
    else next.delete("tab");
    setParams(next);
  };

  const openListSpace = () => setIsListingSpace(true);
  const openPostProfile = () => setIsPostingProfile(true);

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          {
            name: t("shared:megaNav.community.col.discover.head"),
            path: routes.directory,
          },
          { name: pageTitle, path: routes.housing },
        ])}
      />
      {/* One frame and one header for both tabs, at the same place in the
          tree whichever tab is showing: a tab switch swaps only the board
          below and the header's calls to action, so the tablist keeps its
          focus and the header stays put. The housing tab's landlords and
          tips bands sit inside the frame after the board, sharing its left
          edge; the subpage index and outro follow the frame full-bleed. */}
      <FilterPageFrame>
        <FilterPageHeader
          eyebrow={t("economy:housing.hero.eyebrow")}
          title={
            <Translation
              i18nKey="economy:housing.hero.title"
              components={{ em: <em /> }}
            />
          }
          lead={t("economy:housing.hero.lead")}
          note={t("economy:housing.hero.note")}
          isNoteLive
          actions={
            <>
              <Tabs
                tabs={tabs}
                active={active}
                onChange={setActive}
                className={styles.headTabsSwitch}
              />
              {/* Keyed by tab so the group fades in on a switch. */}
              <div key={active} className={styles.headCtas}>
                {isFlatmatesTab ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={openPostProfile}
                  >
                    <FiPlus aria-hidden />{" "}
                    {t("economy:flatmates.postProfileCta")}
                  </Button>
                ) : (
                  <>
                    <Button to={MY_HOUSING_LISTINGS_PATH} variant="ghost">
                      {t("economy:myHousingListings.entryLink")}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={openListSpace}
                    >
                      <FiPlus aria-hidden />{" "}
                      {t("economy:housing.outro.listCta")}
                    </Button>
                  </>
                )}
              </div>
            </>
          }
        />
        {isFlatmatesTab ? (
          <FlatmatesBoard onPostProfile={openPostProfile} />
        ) : (
          <>
            <HousingBoard onListSpace={openListSpace} />
            <HousingBoardBands />
          </>
        )}
      </FilterPageFrame>

      {isFlatmatesTab ? (
        <FlatmatesOutro onPostProfile={openPostProfile} />
      ) : (
        <HousingBoardExtras onListSpace={openListSpace} />
      )}

      {isListingSpace && (
        <ListSpaceModal onClose={() => setIsListingSpace(false)} />
      )}
      {isPostingProfile && (
        <PostProfileModal onClose={() => setIsPostingProfile(false)} />
      )}
    </PageShell>
  );
}
