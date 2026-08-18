import { type ReactNode } from "react";
import { Reveal } from "../../shared/components/ui";
import { type MemberProfile } from "./data/memberProfiles";
import { ProfileHeroMain } from "./ProfileHeroMain";
import { ProfileMutualsCard } from "./ProfileMutualsCard";
import {
  ActivitySection,
  BoardSection,
  GroupsSection,
  NowSection,
  RelatedSection,
  SelectedWorkSection,
  ShapingsSection,
  SkillsSection,
} from "./ProfileContentSections";
import { LookingForEditor } from "./LookingForEditor";
import { WorkEditor } from "./WorkEditor";
import { BoardEditor } from "./BoardEditor";
import { SkillsEditor } from "./SkillsEditor";
import { GroupsEditor } from "./GroupsEditor";
import { ShapingsEditor } from "./ShapingsEditor";
import styles from "./ProfilePage.module.css";

export function Section({
  title,
  subtitle,
  id,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Anchor id for the desktop rail's section-jump nav (`ProfileSectionNav`,
   *  `profileSectionNav.data.ts`) — must match that data file's `id` exactly. */
  id?: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" id={id} className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        {subtitle && <span className={styles.sectionSub}>{subtitle}</span>}
      </div>
      {children}
    </Reveal>
  );
}

export interface ProfileHeroProps {
  profile: MemberProfile;
  /**
   * Whether this is the viewer's own profile. Passed down from the page, which
   * resolves it against the authenticated user — don't re-derive it from a
   * hardcoded slug here, because in live mode the user's slug isn't `currentUserSlug`.
   */
  self?: boolean;
  /** When true, render your own profile exactly as a visitor would see it. */
  asVisitor?: boolean;
  /** Enter inline edit mode (only used on your own profile). */
  onEdit?: () => void;
  /** Enter inline edit mode jumped to the Links section (your own profile). */
  onEditLinks?: () => void;
  /** Preview your profile as a visitor (only used on your own profile). */
  onPreview?: () => void;
  /** Open the "Who sees what" visibility sheet (only used on your own profile). */
  onOpenWhoSeesWhat?: () => void;
  /** Open the account-data sheet (only used on your own profile). */
  onOpenAccountData?: () => void;
  /** Toggle the 24h hide-me switch (only used on your own profile). */
  onToggleHidden?: () => void;
  /** Whether — and until when — the profile is currently hidden. */
  hiddenUntil?: string | null;
}

/**
 * The profile hero's main content: name, role, bio, links, CTAs, vouch row
 * (`ProfileHeroMain`) plus, for a visitor viewing someone else's profile, the
 * `ProfileMutualsCard` floating beside it — the two share `.pheroRow`, a flex
 * row that wraps the card below the text on the narrower end of the desktop
 * range instead of squeezing both to fit. Wrapped in the semantic `<header>`.
 * The left column (`ProfileRail` — portrait, trust signals, owner controls,
 * section-jump nav) is NOT rendered here: it needs to run alongside the WHOLE
 * page, not just the hero row, so `ProfilePage.tsx` renders it directly at
 * the page-level grid (`.pageGrid`/`.railCol` in `ProfilePage.module.css`),
 * as a sibling of this component rather than a child of it.
 */
export function ProfileHero({
  profile,
  self,
  asVisitor = false,
  onEdit,
  onEditLinks,
  onPreview,
  onOpenWhoSeesWhat,
  onOpenAccountData,
  onToggleHidden,
  hiddenUntil,
}: ProfileHeroProps) {
  return (
    <header className={styles.phero}>
      <div className="wrap">
        <div className={styles.pheroRow}>
          <ProfileHeroMain
            profile={profile}
            self={self}
            asVisitor={asVisitor}
            onEdit={onEdit}
            onEditLinks={onEditLinks}
            onPreview={onPreview}
            onOpenWhoSeesWhat={onOpenWhoSeesWhat}
            onOpenAccountData={onOpenAccountData}
            onToggleHidden={onToggleHidden}
            hiddenUntil={hiddenUntil}
          />
          {/* Raw `self` (not `isSelf`): mutual connections stay hidden even
              while previewing your own profile as a visitor would see it —
              you can't have mutual connections with yourself. */}
          {!self && <ProfileMutualsCard slug={profile.slug} />}
        </div>
      </div>
    </header>
  );
}

/** The editable profile lists surfaced as inline editors while in edit mode. */
export interface ProfileContentEdit {
  work: MemberProfile["work"];
  skills: MemberProfile["skills"];
  groups: MemberProfile["groups"];
  board: MemberProfile["board"];
  shapings: MemberProfile["shapings"];
  update: (
    patch: Partial<{
      work: MemberProfile["work"];
      skills: MemberProfile["skills"];
      groups: MemberProfile["groups"];
      board: MemberProfile["board"];
      shapings: MemberProfile["shapings"];
    }>,
  ) => void;
}

export function ProfileContent({
  profile,
  isSelf,
  edit,
}: {
  profile: MemberProfile;
  isSelf?: boolean;
  /** When set (edit mode), the editable sections become inline editors bound to
   *  the draft. Sections with no editor (Activity, Related) are hidden while
   *  editing rather than shown read-only with no affordance. */
  edit?: ProfileContentEdit;
}) {
  return (
    <div className="wrap">
      {/* While editing, the Now editor lives in the hero — showing the committed
          card here too would just be a stale second copy of the same field. */}
      {!edit && <NowSection profile={profile} isSelf={isSelf} />}
      {edit && <LookingForEditor />}
      {edit ? (
        <WorkEditor
          work={edit.work}
          onChange={(work) => edit.update({ work })}
        />
      ) : (
        <SelectedWorkSection profile={profile} />
      )}
      {edit ? (
        <BoardEditor
          board={edit.board}
          onChange={(board) => edit.update({ board })}
        />
      ) : (
        <BoardSection profile={profile} isSelf={isSelf} />
      )}
      {edit ? (
        <SkillsEditor
          skills={edit.skills}
          onChange={(skills) => edit.update({ skills })}
        />
      ) : (
        <SkillsSection profile={profile} />
      )}
      {edit ? (
        <GroupsEditor
          groups={edit.groups}
          onChange={(groups) => edit.update({ groups })}
        />
      ) : (
        <GroupsSection profile={profile} />
      )}
      {edit ? (
        <ShapingsEditor
          shapings={edit.shapings}
          onChange={(shapings) => edit.update({ shapings })}
        />
      ) : (
        <ShapingsSection profile={profile} />
      )}
      {!edit && <ActivitySection profile={profile} />}
      {!edit && <RelatedSection profile={profile} />}
    </div>
  );
}
