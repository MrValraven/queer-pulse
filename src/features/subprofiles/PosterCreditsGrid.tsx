import { FiArrowUpRight } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { formatItemDate } from "../../shared/lib/date";
import { initialsFromName } from "../../shared/lib/initials";
import { safeHref } from "../../shared/lib/safeHref";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/** The first linked collaborator's photo, for a roster artist's cell. */
const CREDIT_AVATAR_SIZE = 40;

/**
 * A Poster page's clients ("worked with") or promoter roster (the line-up
 * wall) as a ruled grid: one cell per name, the name large, then the role and
 * the years in a quiet line each, and the description when the owner wrote
 * one. A cell whose item carries a link names it as an outbound link; the
 * rest of the cell stays plain text. A linked collaborator with a photo puts
 * that photo beside the name.
 */
export function PosterCreditsGrid({
  items,
  interactive,
}: {
  items: SubprofileItemView[];
  interactive: boolean;
}) {
  const { language } = useTranslation();
  return (
    <ul className="pp-credits">
      {items.map((item, index) => {
        const href = interactive ? safeHref(item.url) : null;
        const collaborator = item.collaborators.find(
          (person) => person.avatarUrl,
        );
        const role = [item.subtitle, item.meta].filter(Boolean).join(" · ");
        return (
          <li
            className="pp-credit"
            key={item.id || `${item.title}::${item.date}::${index}`}
          >
            {collaborator?.avatarUrl && (
              <Avatar
                className="pp-credit-av"
                initials={initialsFromName(collaborator.name)}
                src={collaborator.avatarUrl}
                size={CREDIT_AVATAR_SIZE}
              />
            )}
            <b className="pp-credit-name">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer noopener">
                  {item.title}
                  <FiArrowUpRight aria-hidden />
                </a>
              ) : (
                item.title
              )}
            </b>
            {role && <span className="pp-credit-line">{role}</span>}
            {item.date && (
              <span className="pp-credit-line">
                {formatItemDate(item.date, language)}
              </span>
            )}
            {item.description && (
              <span className="pp-credit-desc pp-item-desc">
                {item.description}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
