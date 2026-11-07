import { useState, type ReactNode } from "react";
import { initialsFromName } from "../../shared/lib/initials";
import { Avatar, ExpandableText } from "../../shared/components/ui";
import { ProfilePhotoViewer } from "../members/ProfilePhotoViewer";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ResolvedMentionText } from "../../shared/mentions/ResolvedMentionText";
import { useAuth } from "../../app/providers/authContext";
import { KIND_LABEL_KEYS, personaTitleName } from "./subprofile-kinds";
import { DEFAULT_ACCENT } from "./subprofilePresence.data";
import { canReadPersonaEndorsers } from "./personaEngagement";
import { PersonaEngagementCounts } from "./PersonaEngagementCounts";
import { PersonaOwnerLine } from "./PersonaOwnerLine";
import { hasEngagementCounts, isOwnerTieRedundant } from "./personaHeroMeta";
import {
  bindSeparatorsToPrecedingWord,
  personaNameLengthTier,
} from "./personaHeroNameFit";
import { SubprofileSocialRow } from "./SubprofileSocialRow";
import { SubprofileHeroActions } from "./SubprofileHeroActions";
import { SubprofileTitleBlock } from "./SubprofileTitleBlock";
import { PersonaFoundingBadge } from "./PersonaFoundingBadge";
import type { PersonaAction, PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * The persona page's `.pp-hero` — avatar, name, tagline, social row, actions
 * (delegated to `SubprofileHeroActions`), the endorsement/follower meta line,
 * the workshop-only title block (`SubprofileTitleBlock`, CSS-gated to that
 * one skin), and the bio. The owner tie / standalone address is shown here
 * (not the old `.ownerTie` block) — an unlinked, pseudonymous persona never
 * reveals who is behind it (spec §4).
 *
 * Same markup for every skin family — `data-skin` on the ancestor `.pp`
 * (set by the page host, Task 5) decides how it looks; this component never
 * branches on skin itself. `.pp-cover`/`.pp-runhead`/the article wrapper are
 * owned by the page host too, not this component.
 */
export function SubprofileHero({
  view,
  mode,
  onAction,
  afterTagline,
}: {
  view: PublicSubprofileView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
  /** A skin block under the tagline, above the social row and actions (the
   *  Poster skin's NEXT band, through `SubprofileSkinExtras`'s
   *  `afterTagline` slot). */
  afterTagline?: ReactNode;
}) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [photoOpen, setPhotoOpen] = useState(false);
  const accent = view.accent ?? DEFAULT_ACCENT;

  const linkedToOwner =
    view.linkVisibility === "linked" &&
    Boolean(view.ownerName) &&
    Boolean(view.ownerSlug);
  const interactive = mode !== "preview";
  // Every skin shows an uploaded photo in the hero. The page, studio, runway,
  // gallery and collective skins hide only an initials avatar (see
  // `persona-skins.css`), so gating on the photo keeps the enlarge button off
  // any avatar those skins hide, where it would be a tab-stop with nothing to
  // focus. An initials fallback has nothing more to show anyway. Preview mode
  // stays non-interactive like the meta row.
  const canViewPhoto = interactive && Boolean(view.avatarUrl);
  // A persona still carrying its profession as a name is titled "Owner Name |
  // Poet" here, so the heading names a person. The `.pp-kind` chip below keeps
  // showing the TRANSLATED craft label — it is chrome and follows the reader's
  // language, while this title is the persona's own persisted name.
  const titleName = personaTitleName({
    displayName: view.displayName,
    kind: view.kind,
    ownerName: view.ownerName,
  });

  // A members-only persona's endorser list answers its owners alone (and not
  // while the owner previews the page as a visitor).
  const isEndorserListOpenable =
    view.endorsementCount > 0 &&
    canReadPersonaEndorsers(view, view.viewerIsMember && mode !== "visitor");
  // A zero count is left out on every skin (see `PersonaEngagementCounts`),
  // which also covers a members-only persona: it takes no follows or
  // endorsements, so only a count it held from before it closed can show.
  const hasCounts = hasEngagementCounts(view);
  // A persona named after its owner already says whose it is in the title.
  const isOwnerLineShown = !(
    linkedToOwner && isOwnerTieRedundant(titleName, view.ownerName)
  );

  const avatar = (
    <Avatar
      className="pp-av"
      initials={initialsFromName(view.displayName, "?")}
      src={view.avatarUrl ?? undefined}
      tint="plum"
      size={112}
    />
  );

  return (
    <div className="pp-hero">
      <div className="pp-id">
        {canViewPhoto ? (
          <button
            type="button"
            className="pp-avButton"
            onClick={() => setPhotoOpen(true)}
            aria-label={t("subprofiles:hero.viewPhotoAria", {
              name: view.displayName,
            })}
          >
            {avatar}
          </button>
        ) : (
          avatar
        )}

        <div className="pp-text">
          <div className="pp-nameRow">
            {/* The length tier lets the poster skins shrink a long name so
                the tagline and actions stay on the first screen. */}
            <h1
              className="pp-name"
              data-name-length={personaNameLengthTier(titleName)}
            >
              {bindSeparatorsToPrecedingWord(titleName)}
            </h1>
          </div>
          {/* The craft chip labels the tagline, so `.pp-taglineRow` stacks the
              two under the name — eyebrow, then the sentence it introduces,
              both on the name's left edge. The row is `display: contents` on
              the skins that place the chip themselves (gallery's grid) or hide
              it (page), so their layouts are untouched. */}
          <div className="pp-taglineRow">
            <span className="pp-kind">{t(KIND_LABEL_KEYS[view.kind])}</span>
            <PersonaFoundingBadge
              subprofileId={view.id}
              isFoundingArtist={view.isFoundingArtist}
            />
            {view.tagline && <p className="pp-tagline">{view.tagline}</p>}
          </div>

          {afterTagline}

          <SubprofileSocialRow
            links={view.socialLinks}
            accent={accent}
            interactive={interactive}
          />

          <SubprofileHeroActions view={view} mode={mode} onAction={onAction} />

          {(hasCounts || isOwnerLineShown) && (
            <div className="pp-meta">
              {hasCounts && (
                <PersonaEngagementCounts
                  view={view}
                  interactive={interactive}
                  isEndorserListOpenable={isEndorserListOpenable}
                  onAction={onAction}
                />
              )}
              {isOwnerLineShown && (
                <PersonaOwnerLine
                  view={view}
                  isLinkedToOwner={linkedToOwner}
                  interactive={interactive}
                />
              )}
            </div>
          )}
        </div>

        <SubprofileTitleBlock view={view} />
      </div>

      {/* `/p/:handle` is public (see authGate's PUBLIC_PATHS note), but the
          members, communities and events a bio mentions are gated — so a
          signed-out visitor gets the mention styled and inert rather than a
          link into a wall. */}
      {view.bio && (
        /* `clampMode="height"` because skins style `.pp-bio` with two-column
           text (studio, gallery) and `::first-letter` drop caps (page,
           gallery), all of which the `-webkit-box` line clamp would flatten. */
        <ExpandableText
          className="pp-bio"
          lines={6}
          linesMobile={8}
          clampMode="height"
          resetKey={view.bio}
        >
          <ResolvedMentionText text={view.bio} linkify={loggedIn} />
        </ExpandableText>
      )}

      {photoOpen && view.avatarUrl && (
        <ProfilePhotoViewer
          src={view.avatarUrl}
          name={view.displayName}
          tint="plum"
          onClose={() => setPhotoOpen(false)}
        />
      )}
    </div>
  );
}
