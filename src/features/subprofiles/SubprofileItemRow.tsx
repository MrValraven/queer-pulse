import { FiArrowRight } from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { formatMonthYear } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ItemStateChip } from "./ItemStateChip";
import { SubprofileSocialRow } from "./SubprofileSocialRow";
import { DEFAULT_ACCENT } from "./subprofilePresence.data";
import { WorkRightsFooter } from "./rights/WorkRightsFooter";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { AccentKey } from "./api/subprofiles.api";
import type { SkinFamily } from "./subprofile-skins";

/**
 * One `.pp-row` in a `.pp-list` — field order per the design ground truth:
 * title, subtitle, meta, gig/work-state chip, stage doors, date, ticket
 * arrow, description. A stage-skin row with a live ticket link becomes the
 * whole row's `<a>` (never a link-inside-a-link) — a sold-out gig or a
 * `preview`/inert row stays a plain `<div>`.
 *
 * Every non-poem row's body ends with `WorkRightsFooter` (copyright +
 * provenance), gated on `interactive` (never in the editor's docked
 * `mode="preview"`, mirroring how the poem row's own reader-open is stripped
 * there) and excluded for `section === "poems"`: a poem gets the SAME
 * footer once, inside `PoemReaderModal`, when its row's `onOpen` opens the
 * reader, so showing it again here would double it up.
 */
export function SubprofileItemRow({
  item,
  skin,
  interactive,
  accent,
  onOpen,
  teaser,
  authorName,
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
  /** The persona's public display name, used as the `WorkRightsFooter`
   *  copyright holder for this item. */
  authorName: string;
}) {
  const { t, language } = useTranslation();
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
      {item.date && (
        <span className="when">{formatMonthYear(item.date, language)}</span>
      )}
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
      {interactive && item.section !== "poems" && (
        <WorkRightsFooter authorName={authorName} createdAtISO={item.createdAt} />
      )}
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
