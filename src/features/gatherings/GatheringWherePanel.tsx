import type { ReactNode } from "react";
import {
  FiCompass,
  FiGift,
  FiGlobe,
  FiLock,
  FiMapPin,
  FiTag,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import styles from "./GatheringDetailPanels.module.css";

/** One labelled fact about getting there. `withheld` draws the dashed
 *  treatment used for something the viewer has not earned yet. */
function WhereRow({
  icon: Icon,
  label,
  children,
  withheld = false,
}: {
  icon: IconType;
  label: string;
  children: ReactNode;
  withheld?: boolean;
}) {
  return (
    <div
      className={[styles.row, withheld && styles.rowWithheld]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.rowIcon} aria-hidden>
        <Icon />
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>{children}</span>
      </span>
    </div>
  );
}

/**
 * Where the gathering is, what it costs, and what language it runs in.
 *
 * ADDRESS PRIVACY. The venue name and the neighbourhood are for everybody:
 * they are what makes a gathering findable at all. The exact door is disclosed
 * by the server only to organisers and to people holding a confirmed "going"
 * RSVP, so `address` simply arrives as `null` for everyone else. That absence
 * is stated in words here. Rendering a blank line where a street should be
 * would read as a gathering with no address, which is a different and wrong
 * fact, and a house party would be unlistable without this rule.
 *
 * COST is free text the host wrote, rendered and nothing more (LOC-18). There
 * is no payment integration on this platform, so no button, link or sentence
 * on this panel may imply one.
 */
export function GatheringWherePanel({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const address = gathering.address?.trim() ?? "";
  const arrivalNotes = gathering.arrivalNotes?.trim() ?? "";
  const cost = gathering.cost?.trim() ?? "";
  const neighbourhood = gathering.neighbourhood?.trim() ?? gathering.hood;
  // The venue and the neighbourhood are for everybody: they are what makes a
  // gathering findable at all. Prefer the linked listing's own name when the
  // host attached one, and fall back to whatever they typed.
  const place = [gathering.venueListing?.name ?? gathering.venue, neighbourhood]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>
        {t("gatherings:gathering.where.heading")}
      </h2>
      <div className={styles.rows}>
        {place && (
          <WhereRow
            icon={FiMapPin}
            label={t("gatherings:gathering.where.placeLabel")}
          >
            {place}
          </WhereRow>
        )}

        {address ? (
          <WhereRow
            icon={FiMapPin}
            label={t("gatherings:gathering.where.addressLabel")}
          >
            {address}
          </WhereRow>
        ) : (
          <WhereRow
            icon={FiLock}
            withheld
            label={t("gatherings:gathering.where.addressLabel")}
          >
            {t("gatherings:gathering.where.addressWithheld")}
          </WhereRow>
        )}

        {arrivalNotes && (
          <WhereRow
            icon={FiCompass}
            label={t("gatherings:gathering.where.arrivalLabel")}
          >
            {arrivalNotes}
          </WhereRow>
        )}

        {gathering.language && (
          <WhereRow
            icon={FiGlobe}
            label={t("gatherings:gathering.where.languageLabel")}
          >
            {gathering.language}
          </WhereRow>
        )}

        <WhereRow
          icon={cost ? FiTag : FiGift}
          label={t("gatherings:gathering.where.costLabel")}
        >
          {cost ? (
            cost
          ) : (
            <span className={styles.freeChip}>
              <FiGift aria-hidden />
              {t("gatherings:gathering.where.costFree")}
            </span>
          )}
          <span className={styles.costNote}>
            {t("gatherings:gathering.where.costNote")}
          </span>
        </WhereRow>
      </div>
    </section>
  );
}
