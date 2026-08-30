import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  ChipSelect,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { fullName, memberProfiles } from "./data/memberProfiles";
import { directoryBlurb } from "./directoryBlurb";
import { MemberCardBody } from "./MemberCardBody";
import { initialsOf, tintForSlug } from "./api/members.adapters";
import {
  EMPTY_FILTERS,
  HOOD_OPTIONS,
  IDENTITY_OPTIONS,
  LANGUAGES,
  OPEN_TO_OPTIONS,
  directoryFacetCounts,
  type CheckboxOption,
  type DirectoryFacetCounts,
  type FilterState,
  type MemberCard,
} from "./memberDirectoryFilter.data";
import { FilterProfessions } from "./FilterProfessions";
import { FilterSection } from "./FilterSection";
import { type SectionKey } from "./filterSectionKeys";
import { useChipCount } from "./useChipCount";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Toggle a value within a string[] immutably. */
function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/** A whole checkbox filter card: the collapsible section plus one row per
 *  option, each carrying its availability count.
 *
 *  All three of the sidebar's checkbox groups ("What they're open to", "Where
 *  they're based" and "Identity") are this component. Sharing it is what stops
 *  their count treatment from drifting apart: the zero rule below is subtle
 *  enough that two copies of it would not stay the same for long. */
function FilterCheckboxSection({
  title,
  options,
  selected,
  counts,
  countsAreStale,
  open,
  onToggle,
  onToggleOption,
}: {
  title: string;
  options: CheckboxOption[];
  /** The ids currently ticked in this group. */
  selected: string[];
  /** This group's availability counts, or `undefined` when none are available
   *  — in which case no badges render at all. A missing count must never be
   *  drawn as a zero: "not counted" and "nobody" are different answers. */
  counts?: Record<string, number>;
  countsAreStale: boolean;
  open: boolean;
  onToggle: () => void;
  onToggleOption: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <FilterSection
      title={title}
      open={open}
      onToggle={onToggle}
      activeCount={selected.length}
    >
      {options.map((option) => {
        // A row with no `labelKey` is one whose id already reads as its label
        // in every language: the Lisbon neighbourhoods. See `CheckboxOption`.
        const label = option.labelKey ? t(option.labelKey) : option.id;
        const count = counts?.[option.id];
        const isChecked = selected.includes(option.id);
        // Nobody is left under this option, so it is a dead end — disabled, not
        // merely dimmed, so the affordance matches the outcome. Never while it
        // is CHECKED, though: that count was taken with this very box lifted, so
        // a ticked zero is the one zero still worth clicking (to untick), and
        // disabling it would trap a member in a filter they cannot undo.
        const isUnavailable = count === 0 && !isChecked;
        return (
          <label
            key={option.id}
            className={[
              styles.filterRow,
              isUnavailable && styles.filterRowEmpty,
              countsAreStale && styles.filterRowStale,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={isUnavailable}
              // The visible label and badge are decorative for assistive tech;
              // the control carries the whole phrase, so a screen reader hears
              // "Mentoring, 7 members" rather than "Mentoring 7".
              aria-label={
                count === undefined
                  ? label
                  : t("members:directory.filter.optionWithCount", {
                      label,
                      count,
                    })
              }
              onChange={() => onToggleOption(option.id)}
            />
            {label}
            {count !== undefined && (
              <span
                className={[styles.ct, countsAreStale && styles.ctStale]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden
              >
                {count}
              </span>
            )}
          </label>
        );
      })}
    </FilterSection>
  );
}

export function FiltersSidebar({
  filters,
  members,
  facets,
  countsAreStale = false,
  appliedCount,
  onChange,
  onClearAll,
  sectionsOpen,
  onToggleSection,
  inSheet = false,
}: {
  filters: FilterState;
  /** DEMO ONLY: the whole mock directory, which demo mode counts itself. Live
   *  mode holds one page of a much larger set and must never count it — see
   *  `facets`. */
  members: MemberCard[];
  /** LIVE: the server's per-option availability counts. */
  facets?: DirectoryFacetCounts;
  /** The counts on screen describe the previous filter run; the new one is
   *  still in flight. Dimmed rather than blanked — see `useMembers`. */
  countsAreStale?: boolean;
  appliedCount: number;
  onChange: (next: FilterState) => void;
  onClearAll: () => void;
  sectionsOpen: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  /** Rendered inside the mobile filters sheet — drops the sticky desktop
   *  positioning so the cards flow naturally in the scrolling sheet. */
  inSheet?: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const uid = useId();
  // Counts are counted, never authored — and never counted off the cards on
  // screen. Live mode fetched page 1 (20 cards) of the CURRENT filter, so
  // tallying those would put "Lesbian 3" beside a 400-member directory, a badge
  // that shrank as filters narrowed and read as the community shrinking. The
  // server counts the whole matching set instead (`facets`), and demo mode —
  // where the mock list genuinely IS the whole directory — counts it here to
  // the same contract. Either way `undefined` means "no counts available" and
  // renders no badges at all, which stays better than a wrong number.
  const counts = useMemo<DirectoryFacetCounts | undefined>(
    () => (demoMode ? directoryFacetCounts(members, filters) : facets),
    [demoMode, members, filters, facets],
  );
  const languageChipCount = useChipCount(counts?.languages);
  return (
    <aside className={inSheet ? styles.filtersSheet : styles.filters}>
      <FilterCheckboxSection
        title={t("members:directory.filter.openToTitle")}
        options={OPEN_TO_OPTIONS}
        selected={filters.openTo}
        counts={counts?.openTo}
        countsAreStale={countsAreStale}
        open={sectionsOpen.openTo}
        onToggle={() => onToggleSection("openTo")}
        onToggleOption={(id) =>
          onChange({ ...filters, openTo: toggle(filters.openTo, id) })
        }
      />

      <FilterCheckboxSection
        title={t("members:directory.filter.hoodTitle")}
        options={HOOD_OPTIONS}
        selected={filters.hoods}
        counts={counts?.hoods}
        countsAreStale={countsAreStale}
        open={sectionsOpen.hoods}
        onToggle={() => onToggleSection("hoods")}
        onToggleOption={(id) =>
          onChange({ ...filters, hoods: toggle(filters.hoods, id) })
        }
      />

      <FilterProfessions
        filters={filters}
        counts={counts}
        countsAreStale={countsAreStale}
        onChange={onChange}
        sectionsOpen={sectionsOpen}
        onToggleSection={onToggleSection}
      />

      <FilterCheckboxSection
        title={t("members:directory.filter.identityTitle")}
        options={IDENTITY_OPTIONS}
        selected={filters.identities}
        counts={counts?.identities}
        countsAreStale={countsAreStale}
        open={sectionsOpen.identities}
        onToggle={() => onToggleSection("identities")}
        onToggleOption={(id) =>
          onChange({ ...filters, identities: toggle(filters.identities, id) })
        }
      />

      <FilterSection
        title={t("members:directory.filter.ageTitle")}
        open={sectionsOpen.age}
        onToggle={() => onToggleSection("age")}
        activeCount={
          filters.yearsFrom !== EMPTY_FILTERS.yearsFrom ||
          filters.yearsTo !== EMPTY_FILTERS.yearsTo
            ? 1
            : 0
        }
      >
        <div className={styles.range}>
          <input
            type="number"
            placeholder={t("members:directory.filter.fromPlaceholder")}
            aria-label={t("members:directory.filter.fromPlaceholder")}
            min={0}
            max={9}
            value={filters.yearsFrom}
            onChange={(e) =>
              onChange({
                ...filters,
                yearsFrom: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
          <span className={styles.rangeArrow}>
            <FiArrowRight aria-hidden />
          </span>
          <input
            type="number"
            placeholder={t("members:directory.filter.yearsPlaceholder")}
            aria-label={t("members:directory.filter.yearsPlaceholder")}
            min={0}
            max={9}
            value={filters.yearsTo}
            onChange={(e) =>
              onChange({
                ...filters,
                yearsTo: Math.max(0, Number(e.target.value) || 0),
              })
            }
          />
        </div>
        <p className={styles.rangeNote}>
          <Translation
            i18nKey="members:directory.filter.ageNote"
            components={{ em: <em /> }}
          />
        </p>
      </FilterSection>

      <FilterSection
        title={t("members:directory.filter.languagesTitle")}
        headingId={`${uid}-languages`}
        open={sectionsOpen.languages}
        onToggle={() => onToggleSection("languages")}
        activeCount={filters.languages.length}
      >
        <ChipSelect
          className={countsAreStale ? styles.chipsStale : undefined}
          labelledBy={`${uid}-languages`}
          options={LANGUAGES.map((o) => ({
            value: o.label,
            label: o.label,
            ...languageChipCount(o.label, o.label),
          }))}
          selected={new Set(filters.languages)}
          onToggle={(value) =>
            onChange({
              ...filters,
              languages: toggle(filters.languages, value),
            })
          }
        />
      </FilterSection>

      <div className={styles.clearRow}>
        <button type="button" onClick={onClearAll}>
          {t("members:directory.clearAllFiltersCta")}
        </button>
        <span>
          {t("members:directory.appliedCount", { count: appliedCount })}
        </span>
      </div>
    </aside>
  );
}

/** Loading placeholder mirroring MemberResultCard exactly — no layout shift. */
export function MemberResultSkeleton() {
  return (
    <div className={styles.mCard} aria-hidden>
      <div className={styles.mHead}>
        <SkeletonAvatar size={48} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="62%" height={17} />
          <SkeletonLine width="40%" height={11} style={{ marginTop: 7 }} />
        </div>
      </div>
      <div>
        <SkeletonLine width="90%" height={13} />
        <SkeletonLine width="60%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={styles.mTags}>
        <SkeletonLine width={64} height={18} />
        <SkeletonLine width={52} height={18} />
        <SkeletonLine width={72} height={18} />
      </div>
      <div className={styles.mFoot}>
        <SkeletonLine width="35%" height={11} />
        <SkeletonLine width="22%" height={11} />
      </div>
    </div>
  );
}

export function MemberResultCard({ member }: { member: MemberCard }) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  // The signed-in member sees their own card marked "You" — for now they may be
  // the only registered account, so this keeps the directory from reading as a
  // stranger's list. As other members join, every other card renders normally.
  const isMe = !!user && member.slug === user.profile.slug;
  // Identity resolves from the card itself (live/API cards carry it), falling
  // back to the local registry (demo cards), then to slug-derived defaults so a
  // member with no mock profile never crashes the card. The registry read is
  // DEMO-ONLY: in live mode a real member whose slug happens to collide with a
  // mock entry must keep their own photo/tags rather than have the mock's win.
  const profile = demoMode ? memberProfiles[member.slug] : undefined;
  const name = member.firstName
    ? `${member.firstName} ${member.lastName ?? ""}`.trim()
    : profile
      ? fullName(profile)
      : member.slug;
  const initials = profile?.initials
    ? profile.initials
    : member.firstName
      ? initialsOf(member.firstName, member.lastName ?? "")
      : member.slug.slice(0, 2).toUpperCase();
  const tint = profile?.tint ?? tintForSlug(member.slug);
  const photo = profile?.photo ?? member.avatarUrl ?? undefined;
  // Live/API cards (including the signed-in member's own) can arrive without a
  // tagline or tags; fall back to the colocated profile so the card still reads
  // as a whole person rather than a blank row.
  // The card's blurb is the member's short bio, falling back to the opening of
  // their longer bio. In live mode the backend has already resolved that fallback
  // into `tagline` (the card DTO carries no bio — see directoryBlurb.ts), so
  // `member.role` is already final and the bio branch never fires. The registry
  // bio is passed only in demo mode: pulling a mock bio onto a live card would
  // put words in a real member's mouth.
  const blurb = directoryBlurb(member.role || profile?.role, profile?.bio);
  const tags: MemberCard["tags"] =
    member.tags.length > 0
      ? member.tags
      : (profile?.tags ?? []).map((label) => ({ label }));
  return (
    <Link
      to={`/members/${member.slug}`}
      className={[styles.mCard, isMe && styles.mCardMe]
        .filter(Boolean)
        .join(" ")}
    >
      <MemberCardBody
        name={name}
        slug={member.slug}
        initials={initials}
        tint={tint}
        photo={photo}
        meta={member.meta}
        blurb={blurb}
        tags={tags}
        isMe={isMe}
        vouchCount={member.vouchCount}
        mutualsCount={member.mutualsCount}
        activityBand={member.activityBand}
      />
    </Link>
  );
}
