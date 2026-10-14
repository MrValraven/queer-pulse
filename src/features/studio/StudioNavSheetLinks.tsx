import { useId } from "react";
import { NavLink } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useStudioAccess } from "./api/useStudioAccess";
import { useIsStudioStaff } from "./useIsStudioStaff";
import { useStudioShowcase } from "./useStudioShowcase";
import { SUSTAINER_SINCE_DATE, YEARLY_GIVING } from "./studioShell.data";
import {
  SHEET_FLAG_REVIEW_LINK,
  SHEET_LIVE_LINKS,
  SHEET_LIVE_UTILITY_LINKS,
  SHEET_PRESS_KIT_LINK,
  SHEET_SHOWCASE_GROUPS,
  SHEET_UPLOAD_LINK,
  type StudioNavSheetLink,
} from "./studioNavSheet.data";
import menuStyles from "./StudioAccountMenu.module.css";
import styles from "./StudioNavSheet.module.css";

/** The rail links the phone's bottom tabs leave out, drawn as account panel
 *  rows at the end of the side sheet's scroll region. */
export function StudioNavSheetLinks({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const { uploadablePersonas } = useStudioAccess();
  const isStaff = useIsStudioStaff();
  const utilityLinks = isStaff
    ? [...SHEET_LIVE_UTILITY_LINKS, SHEET_FLAG_REVIEW_LINK]
    : SHEET_LIVE_UTILITY_LINKS;
  const liveLinks =
    uploadablePersonas.length > 0
      ? [...SHEET_LIVE_LINKS, SHEET_UPLOAD_LINK, SHEET_PRESS_KIT_LINK]
      : SHEET_LIVE_LINKS;

  return (
    <nav aria-label={t("studio:rail.v1.navLabel")}>
      {isShowcase ? (
        <>
          {SHEET_SHOWCASE_GROUPS.map((group) => (
            <SheetLinkGroup
              key={group.id}
              labelKey={group.labelKey}
              links={group.links}
              onNavigate={onNavigate}
            />
          ))}
          <SheetGivingNote />
        </>
      ) : (
        <>
          <SheetLinkGroup
            labelKey="studio:shell.sheet.more"
            links={liveLinks}
            onNavigate={onNavigate}
          />
          <SheetLinkGroup
            labelKey="studio:rail.live.utilityLabel"
            links={utilityLinks}
            onNavigate={onNavigate}
          />
        </>
      )}
    </nav>
  );
}

/** One labelled group of rows under a hairline. */
function SheetLinkGroup({
  labelKey,
  links,
  onNavigate,
}: {
  labelKey: string;
  links: StudioNavSheetLink[];
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  return (
    <>
      <div className={menuStyles.divider} />
      <div className={menuStyles.groupLabel} id={labelId}>
        {t(labelKey)}
      </div>
      <div role="group" aria-labelledby={labelId}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [menuStyles.item, isActive && menuStyles.itemActive]
                  .filter(Boolean)
                  .join(" ")
              }
              onClick={onNavigate}
            >
              <Icon aria-hidden className={menuStyles.itemIcon} />
              <span className={menuStyles.itemLabel}>{t(link.labelKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
}

/** The demo member's giving line, as the showcase rail's footer reads it. */
function SheetGivingNote() {
  const format = useFormat();
  return (
    <p className={styles.giving}>
      <Translation
        i18nKey="studio:rail.foot.sustainedSince"
        components={{ em: <em /> }}
        values={{
          date: format.date(SUSTAINER_SINCE_DATE, {
            month: "long",
            year: "numeric",
          }),
        }}
      />
      <span className={styles.givingPaid}>
        <Translation
          i18nKey="studio:rail.foot.paid"
          components={{ b: <b /> }}
          values={{
            amount: format.currency(YEARLY_GIVING.amount),
            count: YEARLY_GIVING.artistCount,
          }}
        />
      </span>
    </p>
  );
}
