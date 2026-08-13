import { useTranslation } from "../../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS, KIND_SECTIONS } from "../subprofile-kinds";
import { SubprofileHero } from "../SubprofileHero";
import { SubprofileSections } from "../SubprofileSections";
import { SubprofileSpotlight } from "../SubprofileSpotlight";
import { SubprofileAffiliations } from "../SubprofileAffiliations";
import { useEndorsers } from "../api/useEndorsers";
import { PracticePractical, PracticeFirstSession, PracticeAccess } from "./PracticeBlocks";
import {
  PracticeApproach,
  PracticeTraining,
  PracticeFees,
  PracticeVenue,
  PracticeAvailability,
  PracticeVouches,
} from "./PracticeTherapistBlocks";
import type { PersonaAction, PersonaViewMode } from "../personaSkinRender";
import type { PublicSubprofileView, SubprofileItemView } from "../api/subprofiles.adapters";

/**
 * The practice skin's (therapist) rich two-column `.wrap` body — branched out
 * of `SubprofilePageBody` (Task 5) instead of squeezing into the single
 * generic `.pp-body` column every other skin shares. Composes the Task-4
 * practice blocks (`PracticeTherapistBlocks`) alongside the pre-existing
 * `PracticeBlocks` (session logistics/first-session/access, still dispatched
 * elsewhere — see below) plus the persona's own two `KIND_SECTIONS[kind]`
 * content sections and its endorsers, split across a main reading column and
 * a sidebar of practical logistics. The practice family covers nine kinds
 * (therapist, coach, bodyworker, yoga_teacher, nutritionist, doula,
 * personal_trainer, sex_educator, peer_support) with different section names
 * per kind (e.g. `coach: ["programmes","credentials"]`) — `KIND_SECTIONS`
 * (not a hardcoded `"specialisms"`/`"credentials"` pair) is what makes this
 * split work for the whole family, not just therapist.
 *
 * `PracticePractical` normally renders through `SubprofileSkinExtras`'
 * `afterBio` slot and `PracticeFirstSession`/`PracticeAccess` through its
 * `end` slot for every other skin's shared `.pp-body` shape — this
 * composition renders them directly instead, so `SubprofilePageBody` skips
 * `SubprofileSkinExtras` entirely for `skin === "practice"` (its practice
 * cases become unreachable dead branches, left in place rather than pulled,
 * since the switch is shared by every other skin). `PracticeReferrals`
 * (the foot's referred-by credits + boundary note) stays owned by
 * `SubprofileAffiliations`, which already swaps it in for endorsers on
 * `skin === "practice"` — rendering it again here would double it up.
 *
 * The generic featured-item `SubprofileSpotlight` (styled for practice via
 * `.pp[data-skin="practice"] .pp-spot` in `persona-skins.css`) still renders
 * here exactly where every other skin's `.pp-body` shows it, so a therapist
 * persona with a featured item doesn't lose that block in the two-column
 * rebuild.
 */
export function PracticeBody({
  data,
  mode,
  onAction,
  onOpenWorkItem,
  onOpenGalleryPhoto,
  onOpenPoem,
}: {
  data: PublicSubprofileView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
  onOpenWorkItem: (item: SubprofileItemView) => void;
  onOpenGalleryPhoto: (item: SubprofileItemView) => void;
  onOpenPoem: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const endorsers = useEndorsers(data.id, data.endorsementCount > 0);
  // Which two sections are this persona's OWN content depends on its kind —
  // the practice family spans nine kinds, not just therapist (e.g. coach's
  // are "programmes"/"credentials", yoga_teacher's are "classes"/"trainings").
  // `secondaryName` is `undefined` for a kind with a single content section;
  // filtering against `undefined` just yields an empty `secondary`, which is
  // fine — its section slot in the sidebar renders nothing.
  const [primaryName, secondaryName] = KIND_SECTIONS[data.kind];
  const primary = {
    ...data,
    sections: data.sections.filter((section) => section.section === primaryName),
  };
  const secondary = {
    ...data,
    sections: data.sections.filter((section) => section.section === secondaryName),
  };
  // `gallery`/`links` are universal — every kind, including practice, can
  // carry them (e.g. the Sofia Neves demo persona has real `gallery`
  // photos). Render whatever's left over (after the kind's own two sections)
  // here, in the main column, so a persona that has used either doesn't lose
  // that content in the two-column rebuild.
  const rest = {
    ...data,
    sections: data.sections.filter(
      (section) => section.section !== primaryName && section.section !== secondaryName,
    ),
  };
  const sectionProps = {
    skin: "practice" as const,
    mode,
    featuredHidden: Boolean(data.featured),
    onOpenWork: onOpenWorkItem,
    onOpenGalleryPhoto,
    onOpenPoem,
  };

  return (
    <>
      <div className="pp-runhead">
        <span>{data.displayName}</span>
        <span>{t(KIND_LABEL_KEYS[data.kind])}</span>
      </div>

      <SubprofileHero view={data} mode={mode} onAction={onAction} />

      <div className="pp-body pp-practice-grid">
        <div className="pp-practice-main">
          {data.featured && (
            <SubprofileSpotlight
              item={data.featured}
              skin="practice"
              mode={mode}
              accent={data.accent}
              authorName={data.displayName}
            />
          )}
          <SubprofileSections persona={primary} {...sectionProps} />
          <PracticeApproach persona={data} />
          <PracticeTraining persona={data} />
          <PracticeFirstSession persona={data} />
          <PracticeVouches endorsers={endorsers.data?.endorsers ?? []} />
          <SubprofileSections persona={rest} {...sectionProps} />
        </div>
        <aside className="pp-practice-side">
          <PracticePractical persona={data} />
          <PracticeFees persona={data} />
          <PracticeAvailability persona={data} />
          <PracticeVenue persona={data} />
          <PracticeAccess persona={data} />
          <SubprofileSections persona={secondary} {...sectionProps} />
        </aside>
      </div>

      <SubprofileAffiliations persona={data} skin="practice" mode={mode} onAction={onAction} />
    </>
  );
}
