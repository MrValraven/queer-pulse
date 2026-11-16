import { useParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminCommunityDetail } from "./AdminCommunityDetail";
import { useAdminCommunity } from "./api/useAdminCommunities";

/**
 * `/admin/communities/:slug`: one community's admin detail as its own route,
 * so it deep-links and browser Back returns to the grid. The shell title is
 * the community's plain name once it loads, which the top-bar breadcrumb
 * shows as its last crumb after the Communities rail link. The detail's own
 * `useAdminCommunity` call shares this query's cache entry.
 */
export function AdminCommunityDetailPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const { data: community, isLoading, isError } = useAdminCommunity(slug);
  // A slug that matches no community names that in the last crumb, so the
  // trail never repeats the section's own name after its link.
  const isMissing = !isLoading && !isError && !community;
  return (
    <AdminShell
      title={
        community?.name ??
        (isMissing ? (
          t("admin:modPanel.notFound.title")
        ) : (
          <Translation
            i18nKey="admin:communities.title"
            components={{ em: <em /> }}
          />
        ))
      }
    >
      <AdminCommunityDetail slug={slug} />
    </AdminShell>
  );
}
