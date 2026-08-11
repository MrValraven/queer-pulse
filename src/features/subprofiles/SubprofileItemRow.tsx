import { FiArrowRight } from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ItemStateChip } from "./ItemStateChip";
import { SubprofileSocialRow } from "./SubprofileSocialRow";
import { DEFAULT_ACCENT } from "./subprofilePresence.data";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { AccentKey } from "./api/subprofiles.api";
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
  accent,
  onOpen,
  teaser,
}: {
  item: SubprofileItemView;
  skin: SkinFamily;
  interactive: boolean;
  /** The persona's accent, used to tint per-item social-link icons.
   *  Falls back to `DEFAULT_ACCENT` when the persona has none. */
  accent?: AccentKey;
  /** When set, the whole row becomes a button that opens a reader (poems).
   *  Mutually exclusive with the stage-skin ticket `<a>` in practice. */
  onOpen?: (item: SubprofileItemView) => void;
  /** Overrides the inline `<p>` body with a one-line teaser (poems). */
  teaser?: string;
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
      <ItemStateChip item={item} />
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
      {teaser ? (
        <p className="pp-row-teaser">{teaser}</p>
      ) : (
        item.description && <p>{item.description}</p>
      )}
      <SubprofileSocialRow
        links={item.structured?.links ?? []}
        accent={accent ?? DEFAULT_ACCENT}
        interactive={interactive && !onOpen}
      />
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

  if (onOpen) {
    return (
      <button
        type="button"
        className={rowClassName}
        onClick={() => onOpen(item)}
        aria-label={t("subprofiles:poem.row.openAria", { title: item.title })}
      >
        {content}
      </button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
