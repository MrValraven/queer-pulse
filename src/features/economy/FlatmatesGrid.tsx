import { FiHome } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Profile } from "./flatmates.data";
import { FlatmateCard } from "./FlatmateCard";
import { FlatmateSkeleton } from "./FlatmateSkeleton";
import styles from "./FlatmatesPage.module.css";

/**
 * The flatmate board's card grid and its three states: loading skeletons, an
 * empty board, and a filtered search that found nobody. Split out of
 * `FlatmatesBoard` so that component stays inside the 200-line rule once the
 * board grew its paging controls.
 */
export function FlatmatesGrid({
  loading,
  boardEmpty,
  profiles,
  sentIds,
  onSayHello,
  onPostProfile,
  onClearFilters,
}: {
  loading: boolean;
  boardEmpty: boolean;
  profiles: Profile[];
  sentIds: Set<number>;
  onSayHello: (profileId: number) => void;
  onPostProfile: () => void;
  onClearFilters: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.grid}>
      {loading ? (
        Array.from({ length: 6 }).map((_, skeletonIndex) => (
          <FlatmateSkeleton key={skeletonIndex} />
        ))
      ) : boardEmpty ? (
        <EmptyState
          className={styles.empty}
          icon={<FiHome />}
          title={t("economy:flatmates.empty.title")}
          description={t("economy:flatmates.empty.description")}
          action={{
            label: t("economy:flatmates.postProfileCta"),
            onClick: onPostProfile,
          }}
        />
      ) : (
        <>
          {profiles.length === 0 && (
            <EmptyState
              className={styles.empty}
              icon={<FiHome />}
              title={t("economy:flatmates.empty.filteredTitle")}
              description={t("economy:flatmates.empty.filteredDescription")}
              action={{
                label: t("economy:flatmates.empty.clearFilters"),
                onClick: onClearFilters,
              }}
            />
          )}
          {profiles.map((profile, profileIndex) => (
            <FadeIn key={profile.id} delay={Math.min(profileIndex, 8) * 60}>
              <FlatmateCard
                p={profile}
                sent={sentIds.has(profile.id)}
                onSayHello={() => onSayHello(profile.id)}
              />
            </FadeIn>
          ))}
        </>
      )}
    </div>
  );
}
