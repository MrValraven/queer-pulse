import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
}

/**
 * "Run by …": a single compact byline row under the listing's identity block,
 * and the demoted successor to the "Who runs it" card that used to fill the
 * right rail with a 52px avatar, a bio and its own buttons. Who runs the place
 * is context for the listing, so it reads as one line beside the name it
 * describes, and the rail keeps its room for what actually changes a plan:
 * where the place is and how to reach it.
 *
 * The claim paths that card also carried now live in `DirectoryAsideFooter`,
 * next to `DirectoryContestControl`.
 */
export function DirectoryOwnerByline({ place }: Props) {
  const { t } = useTranslation();
  const { owner } = place;
  // A listing nobody owns has no identity to print. The flag comes from the
  // backend's `ownerId === null`, and the blank `owner.name` beside it is
  // deliberately ignored here: a listing whose owner chose `anon` visibility
  // arrives with the same blank name and keeps the byline it renders today.
  //
  // The flag covers a second situation beyond the house-authored one: a
  // listing whose member owner erased their account keeps its denormalised
  // `ownerName`, so a departed member's name is still sitting in the payload.
  // Suppressing the byline stops the page crediting someone who asked to be
  // forgotten. That privacy gain is undocumented elsewhere, so it is recorded
  // here where the branch that delivers it lives.
  if (place.isUnclaimed) return null;
  const hasProfileLink = Boolean(owner.inQueerPulse && owner.slug);
  // The role is free text the owner typed and the list-a-business draft starts
  // it empty, so a preview of an unfinished listing would otherwise print two
  // separators around nothing.
  const hasRole = owner.role.trim().length > 0;

  return (
    <div className={s.ownerByline}>
      {/* Decorative: the owner's name is spelled out right beside it, so an
          `alt` here would read the same person twice. */}
      <Avatar
        size={24}
        initials={owner.initials}
        tint={owner.tint}
        src={owner.avatarUrl ?? undefined}
      />
      <span className={s.ownerBylineName}>
        <Translation
          i18nKey="marketing:directory.detail.runBy"
          values={{ name: owner.name }}
          components={
            hasProfileLink
              ? {
                  a: (
                    <Link
                      className={s.ownerBylineLink}
                      to={`${routes.members}/${owner.slug}`}
                    />
                  ),
                }
              : {}
          }
        />
      </span>
      {hasRole && (
        <span className={s.ownerBylineItem}>
          <span aria-hidden>·</span>
          <span>{owner.role}</span>
        </span>
      )}
      {/* The person who runs this place either has a QueerPulse account or
          does not. The second case is not an endorsement: nobody vouched for
          anything, a member simply put the listing here. The line says that
          and nothing more, so the platform's real vouching system keeps the
          only claim to the word. */}
      <span className={s.ownerBylineItem}>
        <span aria-hidden>·</span>
        <span className={s.ownerBylineState}>
          {owner.inQueerPulse && (
            <span className={s.ownerBylineDot} aria-hidden />
          )}
          {t(
            owner.inQueerPulse
              ? "marketing:directory.detail.onQueerPulse"
              : "marketing:directory.detail.addedByMember",
          )}
        </span>
      </span>
    </div>
  );
}
