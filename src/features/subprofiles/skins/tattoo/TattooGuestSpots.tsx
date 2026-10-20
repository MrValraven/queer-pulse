import { useId, useState } from "react";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { shopDomain } from "./editor/tattooItemDraft";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import { formatTattooDay } from "./tattooView.helpers";
import styles from "./TattooOut.module.css";

function GuestSpotRow({
  item,
  isLinkInert,
}: {
  item: SubprofileItemView;
  isLinkInert: boolean;
}) {
  const { t, language } = useTranslation();
  const endDate = item.structured?.spot?.endDate ?? "";
  const start = formatTattooDay(item.date, language);
  const dayText =
    endDate !== "" && endDate !== item.date
      ? t("subprofiles:tattoo.spots.range", {
          start,
          end: formatTattooDay(endDate, language),
        })
      : start;
  const spotType = item.structured?.spot?.type ?? "guest_spot";
  const linkDomain = shopDomain(item.url);
  return (
    <li className={styles.row}>
      <h3 className={styles.rowTitle}>{item.title}</h3>
      <p className={styles.meta}>
        {[item.subtitle, dayText].filter((part) => part !== "").join(" · ")}
      </p>
      <span className={styles.typeTag}>
        {t(`subprofiles:tattoo.spots.type.${spotType}`)}
      </span>
      {linkDomain !== null &&
        (isLinkInert ? (
          <span className={styles.link}>{linkDomain}</span>
        ) : (
          <a
            className={styles.link}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkDomain}
          </a>
        ))}
    </li>
  );
}

/** Upcoming guest spots and conventions, then the past ones folded under "Show past". */
export function TattooGuestSpots({ view, mode }: TattooBlockProps) {
  const { t } = useTranslation();
  const [isPastOpen, setIsPastOpen] = useState(false);
  const pastRegionId = useId();
  const isLinkInert = mode === "preview";
  const { upcoming, past } = view.guestSpots;
  return (
    <TattooBlock
      blockKey="guestSpots"
      heading={t("subprofiles:tattoo.block.guestSpots.heading")}
      hasContent={view.hasContent.guestSpots}
      emptyBodyKey="subprofiles:tattoo.block.guestSpots.empty"
      emptyActionKey="subprofiles:tattoo.block.guestSpots.action"
    >
      {upcoming.length > 0 && (
        <ul className={styles.list}>
          {upcoming.map((item) => (
            <GuestSpotRow key={item.id} item={item} isLinkInert={isLinkInert} />
          ))}
        </ul>
      )}
      {past.length > 0 && (
        <>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={isPastOpen}
            aria-controls={pastRegionId}
            onClick={() => setIsPastOpen((isOpen) => !isOpen)}
          >
            {t(
              isPastOpen
                ? "subprofiles:tattoo.spots.hidePast"
                : "subprofiles:tattoo.spots.showPast",
            )}
          </button>
          <div id={pastRegionId}>
            <Collapse isOpen={isPastOpen}>
              <ul className={`${styles.list} ${styles.pastList}`}>
                {past.map((item) => (
                  <GuestSpotRow
                    key={item.id}
                    item={item}
                    isLinkInert={isLinkInert}
                  />
                ))}
              </ul>
            </Collapse>
          </div>
        </>
      )}
    </TattooBlock>
  );
}
