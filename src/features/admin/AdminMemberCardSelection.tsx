import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminDrawer } from "./ui";
import { AdminMemberDrawerSkeleton } from "./AdminMemberDrawerSkeleton";

/**
 * The drawer frame while a member card is still loading. Live mode fetches
 * over the network, so the slide-over opens straight away with its body
 * skeletoned rather than leaving the click with no visible result. Demo mode
 * resolves from the fixtures instantly and never renders this.
 */
export function AdminMemberCardLoadingDrawer({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminDrawer
      label={t("admin:members.flagged.loadingDrawerLabel")}
      onClose={onClose}
      head={<SkeletonLine width={180} height={22} />}
    >
      <AdminMemberDrawerSkeleton />
    </AdminDrawer>
  );
}
