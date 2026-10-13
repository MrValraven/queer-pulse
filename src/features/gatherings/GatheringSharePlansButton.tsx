import { useState } from "react";
import { FiShield } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SharePlansModal } from "./SharePlansModal";
import type { GatheringDetail } from "./data";
import { useGatheringPreview } from "./guestPreview/gatheringPreviewContext";

/**
 * The header's one-tap way to tell somebody you trust where you'll be. It sits
 * in the gathering's icon row beside "Add to calendar" and only shows once the
 * member is going or waitlisted, since there are no plans to share before that.
 *
 * `?share=plans` (the Go together group sheet links here) opens Share plans on
 * arrival. Derived from the URL on every render, so it also opens when the
 * member is already on this page and only the query changes. Closing takes the
 * parameter back off the URL.
 *
 * Live only, as it was when it lived in the detail panels: a demo gathering
 * keeps the prototype's header without it.
 */
export function GatheringSharePlansButton({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [isSharePlansOpenLocally, setIsSharePlansOpenLocally] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { viewAs } = useGatheringPreview();
  if (demoMode) return null;

  const isGoing =
    gathering.myRsvpStatus === "going" ||
    gathering.myRsvpStatus === "waitlisted";
  if (!isGoing) return null;

  const isSharePlansRequested =
    viewAs === null && searchParams.get("share") === "plans";
  const isSharePlansOpen = isSharePlansOpenLocally || isSharePlansRequested;
  const closeSharePlans = () => {
    setIsSharePlansOpenLocally(false);
    if (!searchParams.has("share")) return;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("share");
    setSearchParams(nextSearchParams, { replace: true });
  };
  const label = t("gatherings:sharePlans.openCta");

  return (
    <>
      <Tooltip label={label} placement="bottom">
        <IconButton
          aria-label={label}
          onClick={() => setIsSharePlansOpenLocally(true)}
        >
          <FiShield aria-hidden />
        </IconButton>
      </Tooltip>
      {isSharePlansOpen && (
        <SharePlansModal gathering={gathering} onClose={closeSharePlans} />
      )}
    </>
  );
}
