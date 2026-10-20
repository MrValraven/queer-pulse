import { Link } from "react-router-dom";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import { formatTattooDay } from "./tattooView.helpers";
import styles from "./TattooOut.module.css";

function FlashDayCard({
  item,
  isLinkInert,
}: {
  item: SubprofileItemView;
  isLinkInert: boolean;
}) {
  const { t, language } = useTranslation();
  const cause = item.structured?.flashDay?.cause ?? "";
  const eventSlug = item.linkedEvent?.slug ?? "";
  const hasOwnUrl = item.url.startsWith("https://");
  let link = null;
  if (eventSlug !== "" || hasOwnUrl) {
    const label =
      eventSlug !== ""
        ? t("subprofiles:tattoo.flashDays.seeEvent")
        : t("subprofiles:tattoo.flashDays.moreDetails");
    if (isLinkInert) {
      link = <span className={styles.link}>{label}</span>;
    } else if (eventSlug !== "") {
      link = (
        <Link className={styles.link} to={`${routes.gatherings}/${eventSlug}`}>
          {label}
        </Link>
      );
    } else {
      link = (
        <a
          className={styles.link}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      );
    }
  }
  return (
    <li className={styles.card}>
      {item.imageUrl !== "" && (
        <ImageSlot src={item.imageUrl} alt="" height={140} radius={10} />
      )}
      <div className={styles.cardBody}>
        <h3 className={styles.rowTitle}>{item.title}</h3>
        <p className={styles.meta}>{formatTattooDay(item.date, language)}</p>
        {item.subtitle !== "" && <p className={styles.meta}>{item.subtitle}</p>}
        {cause !== "" && <p className={styles.cause}>{cause}</p>}
        {link}
      </div>
    </li>
  );
}

/** Flash days and fundraisers; a card links to its event page while the event resolves. */
export function TattooFlashDays({ view, mode }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="flashDays"
      heading={t("subprofiles:tattoo.block.flashDays.heading")}
      hasContent={view.hasContent.flashDays}
      emptyBodyKey="subprofiles:tattoo.block.flashDays.empty"
      emptyActionKey="subprofiles:tattoo.block.flashDays.action"
    >
      <ul className={styles.cards}>
        {view.itemsBySection.flash_days.map((item) => (
          <FlashDayCard
            key={item.id}
            item={item}
            isLinkInert={mode === "preview"}
          />
        ))}
      </ul>
    </TattooBlock>
  );
}
