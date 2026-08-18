import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useHowCommunitiesWorkModal } from "../../marketing/useHowCommunitiesWorkModal";
import { spotlightCommunities } from "./Communities.data";
import { useCommunityFilters } from "./useCommunityFilters";
import { CommunitiesToolbar } from "./CommunitiesToolbar";
import { CommunityRail } from "./CommunityRail";
import { CommunitySpotlight } from "./CommunitySpotlight";
import styles from "./Communities.module.css";

export function Communities() {
  const { t } = useTranslation();
  const { openModal, modalElement } = useHowCommunitiesWorkModal();
  const { state, patch, clear, visible, total, langOptions, hoodOptions } =
    useCommunityFilters();

  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(
    spotlightCommunities[0]?.anchor ?? null,
  );

  // Derive the effective selection during render (no syncing effect): if the
  // picked community has been filtered out, fall back to the first visible one.
  const activeAnchor =
    selectedAnchor && visible.some((d) => d.anchor === selectedAnchor)
      ? selectedAnchor
      : (visible[0]?.anchor ?? null);

  const selectCommunity = (anchor: string) => {
    if (anchor === activeAnchor) return;
    setSelectedAnchor(anchor);
  };

  const selected =
    spotlightCommunities.find((d) => d.anchor === activeAnchor) ?? null;
  const shown = visible.length;

  return (
    <section className={styles.section} id="communities">
      <div className="wrap">
        <Reveal>
          <div className={styles.head}>
            <div className={styles.headText}>
              <div className={styles.eyebrow}>
                <span className={styles.live} aria-hidden />
                {t("homepage:communities.eyebrow")}
              </div>
              <h2 className={styles.title}>
                <Translation
                  i18nKey="homepage:communities.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <p className={styles.sub}>{t("homepage:communities.sub")}</p>
            </div>
            <div className={styles.headRight}>
              <Button variant="ghost" onClick={openModal}>
                {t("homepage:communities.howCommunitiesWorkCta")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <CommunitiesToolbar
            state={state}
            patch={patch}
            langOptions={langOptions}
            hoodOptions={hoodOptions}
          />
        </Reveal>

        <Reveal>
          <p className={styles.resultCount}>
            <Translation
              i18nKey={
                shown === total
                  ? "homepage:communities.resultCount.all"
                  : "homepage:communities.resultCount.shown"
              }
              values={{ count: shown, total }}
              components={{ b: <b /> }}
            />
          </p>
        </Reveal>

        <Reveal>
          <div className={styles.grid}>
            <CommunityRail
              list={visible}
              selectedAnchor={activeAnchor}
              onSelect={selectCommunity}
              onClear={clear}
            />
            <CommunitySpotlight
              key={activeAnchor ?? "empty"}
              community={selected}
              onClear={clear}
            />
          </div>
        </Reveal>
      </div>
      {modalElement}
    </section>
  );
}
