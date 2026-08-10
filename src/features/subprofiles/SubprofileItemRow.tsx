import { FiArrowRight } from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  GIG_STATE_LABEL,
  WORK_STATE_CLASS,
  WORK_STATE_LABEL,
} from "./personaSkinRender";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { SkinFamily } from "./subprofile-skins";

/**
 * One `.pp-row` in a `.pp-list` — field order per the design ground truth:
 * title, subtitle, meta, gig/work-state chip, stage doors, date, ticket
 * arrow, description. A stage-skin row with a live ticket link becomes the
 * whole row's `<a>` (never a link-inside-a-link) — a sold-out gig or a
 * `preview`/inert row stays a plain `<div>`.
 */
export function SubprofileItemRow({
  item,
  skin,
  interactive,
}: {
  item: SubprofileItemView;
  skin: SkinFamily;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const isOff = item.gigState === "cancelled";
  const ticketHref =
    skin === "stage" && item.gigState !== "sold_out"
      ? safeHref(item.ticketUrl)
      : null;
  const isTicket = interactive && Boolean(ticketHref);

  const rowClassName = ["pp-row", isOff && "is-off", isTicket && "is-ticket"]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <b>{item.title}</b>
      {item.subtitle && <small>{item.subtitle}</small>}
      {item.meta && <small>{item.meta}</small>}
      {item.gigState && (
        <span className={`gigstate ${item.gigState}`}>
          {t(GIG_STATE_LABEL[item.gigState])}
        </span>
      )}
      {item.workState && (
        <span className={`gigstate ${WORK_STATE_CLASS[item.workState]}`}>
          {t(WORK_STATE_LABEL[item.workState])}
        </span>
      )}
      {skin === "stage" && item.doors && (
        <span className="doors">
          {t("subprofiles:row.doors", { doors: item.doors })}
        </span>
      )}
      {item.date && <span className="when">{item.date}</span>}
      {skin === "stage" && ticketHref && (
        <span className="ticketgo">
          <FiArrowRight aria-hidden />
        </span>
      )}
      {item.description && <p>{item.description}</p>}
    </>
  );

  if (isTicket && ticketHref) {
    return (
      <a
        className={rowClassName}
        href={ticketHref}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={t("subprofiles:row.ticketAria", { title: item.title })}
      >
        {content}
      </a>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
