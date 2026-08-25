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
  HOOD_LABEL_KEY,
  IDENTITY_OPTIONS,
  LANGUAGES,
  NEIGHBOURHOODS,
  OPEN_TO_OPTIONS,
  facetCounts,
  type FilterState,
  type MemberCard,
} from "./memberDirectoryFilter.data";
import { FilterProfessions } from "./FilterProfessions";
import { FilterSection } from "./FilterSection";
import { type SectionKey } from "./filterSectionKeys";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Toggle a value within a string[] immutably. */
function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function FiltersSidebar({
  filters,
  members,
  appliedCount,
  onChange,
  onClearAll,
  sectionsOpen,
  onToggleSection,
  inSheet = false,
}: {
  filters: FilterState;
  /** Every member loaded so far — the population the counts are taken from. */
  members: MemberCard[];
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
  // Counts are read off the loaded directory, never authored.
  //
  // DEMO-ONLY, because only there does "the loaded directory" mean the whole
  // of it: the mock list arrives as one synthetic page. In live mode
  // `useMembers` has fetched page 1 (20 cards) of the CURRENT filter, so a
  // badge reading "Lesbian 3" beside a 400-member directory is not a population
  // figure at all — and it shrank as filters narrowed, which read as the
  // community shrinking. Better no number than a wrong one. Bring the badges
  // back when `GET /members` returns facet totals alongside `total`.
  const openToCounts = useMemo<Record<string, number>>(
    () => (demoMode ? facetCounts(members, "openTo") : {}),
    [members, demoMode],
  );
  const identityCounts = useMemo<Record<string, number>>(
    () => (demoMode ? facetCounts(members, "identities") : {}),
    [members, demoMode],
  );
  return (
    <aside className={inSheet ? styles.filtersSheet : styles.filters}>
      <FilterSection
        title={t("members:directory.filter.openToTitle")}
        open={sectionsOpen.openTo}
        onToggle={() => onToggleSection("openTo")}
        activeCount={filters.openTo.length}
      >
        {OPEN_TO_OPTIONS.map((option) => (
          <label key={option.id} className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.openTo.includes(option.id)}
              onChange={() =>
                onChange({
                  ...filters,
                  openTo: toggle(filters.openTo, option.id),
                })
              }
            />
            {t(option.labelKey)}
            {openToCounts[option.id] !== undefined && (
              <span className={styles.ct}>{openToCounts[option.id]}</span>
            )}
          </label>
        ))}
      </FilterSection>

      <FilterSection
        title={t("members:directory.filter.hoodTitle")}
        headingId={`${uid}-hoods`}
        open={sectionsOpen.hoods}
        onToggle={() => onToggleSection("hoods")}
        activeCount={filters.hoods.length}
      >
        <ChipSelect
          labelledBy={`${uid}-hoods`}
          options={NEIGHBOURHOODS.map((o) => ({
            value: o.label,
            label: HOOD_LABEL_KEY[o.label]
              ? t(HOOD_LABEL_KEY[o.label]!)
              : o.label,
          }))}
          selected={new Set(filters.hoods)}
          onToggle={(value) =>
            onChange({ ...filters, hoods: toggle(filters.hoods, value) })
          }
        />
      </FilterSection>

      <FilterProfessions
        filters={filters}
        onChange={onChange}
        sectionsOpen={sectionsOpen}
        onToggleSection={onToggleSection}
      />

      <FilterSection
        title={t("members:directory.filter.identityTitle")}
        open={sectionsOpen.identities}
        onToggle={() => onToggleSection("identities")}
        activeCount={filters.identities.length}
      >
        {IDENTITY_OPTIONS.map((option) => (
          <label key={option.id} className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.identities.includes(option.id)}
              onChange={() =>
                onChange({
                  ...filters,
                  identities: toggle(filters.identities, option.id),
                })
              }
            />
            {t(option.labelKey)}
            {identityCounts[option.id] !== undefined && (
              <span className={styles.ct}>{identityCounts[option.id]}</span>
            )}
          </label>
        ))}
      </FilterSection>

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
          labelledBy={`${uid}-languages`}
          options={LANGUAGES.map((o) => o.label)}
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
      />
    </Link>
  );
}
