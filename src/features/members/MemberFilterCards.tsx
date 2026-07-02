import { Link } from "react-router-dom";
import {
  Avatar,
  ChipSelect,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { fullName, memberProfiles } from "./data/memberProfiles";
import { initialsOf, tintForSlug } from "./api/members.adapters";
import {
  IDENTITY,
  LANGUAGES,
  NEIGHBOURHOODS,
  OPEN_TO,
  type FilterState,
  type MemberCard,
} from "./memberDirectoryFilter.data";
import { FilterProfessions } from "./FilterProfessions";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Toggle a value within a string[] immutably. */
function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function FiltersSidebar({
  filters,
  appliedCount,
  onChange,
  onClearAll,
}: {
  filters: FilterState;
  appliedCount: number;
  onChange: (next: FilterState) => void;
  onClearAll: () => void;
}) {
  return (
    <aside className={styles.filters}>
      <div className={styles.filterCard}>
        <h4>What they're open to</h4>
        {OPEN_TO.map((o) => (
          <label key={o.label} className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.openTo.includes(o.label)}
              onChange={() =>
                onChange({
                  ...filters,
                  openTo: toggle(filters.openTo, o.label),
                })
              }
            />
            {o.label}
            <span className={styles.ct}>{o.count}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterCard}>
        <h4>Where they're based</h4>
        <ChipSelect
          options={NEIGHBOURHOODS.map((o) => o.label)}
          selected={new Set(filters.hoods)}
          onToggle={(value) =>
            onChange({ ...filters, hoods: toggle(filters.hoods, value) })
          }
        />
      </div>

      <FilterProfessions filters={filters} onChange={onChange} />

      <div className={styles.filterCard}>
        <h4>Identity · self-declared</h4>
        {IDENTITY.map((o) => (
          <label key={o.label} className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.identities.includes(o.label)}
              onChange={() =>
                onChange({
                  ...filters,
                  identities: toggle(filters.identities, o.label),
                })
              }
            />
            {o.label}
            <span className={styles.ct}>{o.count}</span>
          </label>
        ))}
      </div>

      <div className={styles.filterCard}>
        <h4>Member age</h4>
        <div className={styles.range}>
          <input
            type="number"
            placeholder="From"
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
          <span>→</span>
          <input
            type="number"
            placeholder="Years"
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
          Years on QueerPulse.{" "}
          <em>Newer members appear with a "first year" badge by default.</em>
        </p>
      </div>

      <div className={styles.filterCard}>
        <h4>Languages</h4>
        <ChipSelect
          options={LANGUAGES.map((o) => o.label)}
          selected={new Set(filters.languages)}
          onToggle={(value) =>
            onChange({
              ...filters,
              languages: toggle(filters.languages, value),
            })
          }
        />
      </div>

      <div className={styles.clearRow}>
        <button type="button" onClick={onClearAll}>
          Clear all filters
        </button>
        <span>{appliedCount} applied</span>
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
      <SkeletonLine width="90%" height={13} />
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
  // Identity resolves from the card itself (live/API cards carry it), falling
  // back to the local registry (demo cards), then to slug-derived defaults so a
  // member with no mock profile never crashes the card.
  const profile = memberProfiles[member.slug];
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
  return (
    <Link to={`/members/${member.slug}`} className={styles.mCard}>
      <div className={styles.mHead}>
        <Avatar
          initials={initials}
          tint={tint}
          src={photo}
          size={48}
          alt={name}
        />
        <div>
          <div className={styles.mName}>{name}</div>
          <div className={styles.mPron}>{member.meta}</div>
        </div>
      </div>
      <div className={styles.mRole}>{member.role}</div>
      <div className={styles.mTags}>
        {member.tags.map((tag) => (
          <span
            key={tag.label}
            className={[styles.mTag, tag.match && styles.mTagMatch]
              .filter(Boolean)
              .join(" ")}
          >
            {tag.label}
          </span>
        ))}
      </div>
      <div className={styles.mFoot}>
        <span className={styles.vouch}>{member.vouch}</span>
        <span>{member.mutuals}</span>
      </div>
    </Link>
  );
}
