import { useMemo } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOUSING_SUBPAGES } from "./housing.data";
import { useLandlords } from "./api/useLandlords";
import { HousingLandlords, HousingTips } from "./HousingSections";

/** The housing tab's bands inside the filter page frame, after the sidebar
 *  and results: the landlords band and the renting tips, so they line up
 *  with the board's left edge. */
export function HousingBoardBands() {
  const { data: landlords = [] } = useLandlords();
  return (
    <>
      <HousingLandlords landlords={landlords} />

      <HousingTips />
    </>
  );
}

/** Everything the housing tab shows after the filter page frame: the
 *  full-bleed housing subpage index and the outro. `HousingPage` renders it
 *  after the frame while the Housing tab is showing. */
export function HousingBoardExtras({
  onListSpace,
}: {
  /** Opens the "List your space" modal the page owns. */
  onListSpace: () => void;
}) {
  const { t } = useTranslation();
  const subpages = useMemo(
    () =>
      HOUSING_SUBPAGES.map((subpage) => ({
        to: subpage.to,
        label: t(subpage.labelKey),
        blurb: t(subpage.blurbKey),
      })),
    [t],
  );

  return (
    <>
      <SubpageIndex
        eyebrow={t("economy:housing.subpages.eyebrow")}
        title={t("economy:housing.subpages.title")}
        items={subpages}
      />

      <Outro
        title={
          <Translation
            i18nKey="economy:housing.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:housing.outro.sub")}
      >
        <Button type="button" variant="primary" size="lg" onClick={onListSpace}>
          {t("economy:housing.outro.listCta")}
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          {t("economy:housing.outro.askForum")} <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </>
  );
}
