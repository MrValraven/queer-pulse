import type { ReactNode } from "react";
import { FiEye } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { EmptyState } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useEventPreview } from "../api/useEvent";
import type { GatheringDetail } from "../data";
import { GatheringPreviewProvider } from "./GatheringPreviewProvider";
import type { GuestPreviewRole } from "./guestPreview";
import { useGuestPreviewNavigation } from "./useGuestPreviewNavigation";

/**
 * A host's gathering page as a guest would read it. Fetches the preview
 * detail, then renders the ordinary page body inside the preview provider,
 * which makes every guest action inert. `GatheringPage` only mounts this for
 * a live organiser, so nobody else ever sends `viewAs`.
 */
export function GatheringGuestPreview({
  param,
  viewAs,
  loadingFallback,
  renderBody,
}: {
  param: string | undefined;
  viewAs: GuestPreviewRole;
  loadingFallback: ReactNode;
  renderBody: (gathering: GatheringDetail) => ReactNode;
}) {
  const { t } = useTranslation();
  const { exitPreview } = useGuestPreviewNavigation();
  const { data, isError } = useEventPreview(param, viewAs);

  if (isError && !data) {
    return (
      <PageShell>
        <div className="wrap">
          <EmptyState
            icon={<FiEye />}
            title={t("gatherings:preview.errorTitle")}
            description={t("gatherings:preview.errorBody")}
            action={{
              label: t("gatherings:preview.exitCta"),
              onClick: exitPreview,
            }}
          />
        </div>
      </PageShell>
    );
  }
  if (!data) return <>{loadingFallback}</>;
  return (
    <GatheringPreviewProvider viewAs={viewAs}>
      {renderBody(data.gathering)}
    </GatheringPreviewProvider>
  );
}
