import type { Dispatch, SetStateAction } from "react";
import { FiUsers } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { CommunityType } from "../homepage/data/types";

/**
 * The Discover grid's "nothing to show" state — three branches, ordered by
 * specificity: a search that came up empty, a category/toggle filter that
 * came up empty, then the platform-wide "no communities exist yet" fallback.
 * `type`/`q`/`access` are server-side query params (COM-3), so an empty
 * result here means the server (plus the client-side "busy" filter) found
 * nothing, not that a client-side re-filter over one loaded page came up
 * short. Split out of `CommunitiesDiscover` purely to keep that component
 * under the repo's 200-line cap.
 */
export function CommunitiesDiscoverEmptyState({
  q,
  filter,
  isOpenOnly,
  isBusyOnly,
  tagIds,
  setSearchInput,
  setFilter,
  setOpenOnly,
  setBusyOnly,
  setTagIds,
}: {
  q: string;
  filter: "all" | CommunityType;
  isOpenOnly: boolean;
  isBusyOnly: boolean;
  tagIds: string[];
  setSearchInput: Dispatch<SetStateAction<string>>;
  setFilter: Dispatch<SetStateAction<"all" | CommunityType>>;
  setOpenOnly: Dispatch<SetStateAction<boolean>>;
  setBusyOnly: Dispatch<SetStateAction<boolean>>;
  setTagIds: Dispatch<SetStateAction<string[]>>;
}) {
  const { t } = useTranslation();

  if (q) {
    return (
      <EmptyState
        icon={<FiUsers />}
        title={t("communities:discover.empty.search.title")}
        description={t("communities:discover.empty.search.description")}
        action={{
          label: t("communities:discover.empty.search.cta"),
          onClick: () => setSearchInput(""),
        }}
      />
    );
  }

  if (filter !== "all" || isOpenOnly || isBusyOnly || tagIds.length > 0) {
    return (
      <EmptyState
        icon={<FiUsers />}
        title={t("communities:discover.empty.filtered.title")}
        description={t("communities:discover.empty.filtered.description")}
        action={{
          label: t("communities:discover.empty.filtered.cta"),
          onClick: () => {
            setFilter("all");
            setOpenOnly(false);
            setBusyOnly(false);
            setTagIds([]);
          },
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={<FiUsers />}
      title={t("communities:discover.empty.none.title")}
      description={t("communities:discover.empty.none.description")}
      action={{
        label: t("communities:discover.empty.none.cta"),
        to: routes.startCommunity,
      }}
    />
  );
}
