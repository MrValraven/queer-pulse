import { FiSearch, FiUsers } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSuggestedPeople } from "../feed/SuggestedPeople.api";
import { SuggestedPeopleStrip } from "../feed/SuggestedPeopleStrip";

/**
 * What the All-connections tab shows when it has nothing to show.
 *
 * SOC-05 fills the seam this component was kept for. A member with no
 * connections used to be handed a directory of fourteen filters and no
 * starting point; when the platform can make an explainable suggestion, it
 * makes one here instead. Every card carries the fact behind it (a shared
 * room, mutual connections, a word both people wrote), so this is a set of
 * openings rather than a wall of strangers.
 *
 * The plain empty state is still the answer when there is nothing honest to
 * suggest: a brand-new member who has joined nothing and written nothing gets
 * no filler, because a suggestion that cannot say why is not a suggestion.
 *
 * `isPersistent` keeps the strip's hide control off this surface. On the feed
 * the strip is an extra above the real content, so hiding it is reasonable;
 * here it IS the content, and hiding it would leave a blank tab.
 */
export function ConnectionsEmpty() {
  const { t } = useTranslation();
  const { people, isLoading } = useSuggestedPeople();

  if (isLoading || people.length > 0) {
    return <SuggestedPeopleStrip isPersistent />;
  }

  return (
    <EmptyState
      compact
      icon={<FiUsers />}
      title={t("connect:allTab.emptyTitle")}
      description={t("connect:allTab.emptyDescription")}
      action={{
        label: t("connect:allTab.findMembers"),
        to: routes.members,
      }}
    />
  );
}

/** The same tab when a search or filter matched nobody. */
export function ConnectionsNoMatches({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      compact
      icon={<FiSearch />}
      title={t("connect:allTab.emptySearchTitle")}
      description={t("connect:allTab.emptySearchDescription")}
      action={{
        label: t("connect:allTab.clearSearch"),
        onClick: onClear,
      }}
    />
  );
}
