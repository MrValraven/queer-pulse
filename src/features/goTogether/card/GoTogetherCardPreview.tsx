import { useRef } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GatheringDetail } from "../../gatherings/data";
import { useGatheringPreview } from "../../gatherings/guestPreview/gatheringPreviewContext";
import { useGoTogetherCard } from "../api/useGoTogetherCard";
import { GoTogetherCardFrame } from "./GoTogetherCard";
import { GoTogetherOptInPanel } from "./GoTogetherOptInPanel";
import { PanelHeader } from "./GoTogetherStatePanels";

/**
 * Go together as a newly going guest first meets it, for a host previewing
 * their gathering: the opt-in form with the host's own questions. The host's
 * own card read says whether Go together is switched on at all; nothing here
 * opts anybody in. The form stays live so the host can walk through it.
 */
export function GoTogetherCardPreview({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const { runGuestAction } = useGatheringPreview();
  const { data: card } = useGoTogetherCard(gathering.slug);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  if (gathering.myRsvpStatus !== "going") return null;
  if (!card || card.state === "unavailable") return null;
  return (
    <GoTogetherCardFrame sectionRef={sectionRef} headingRef={headingRef}>
      <PanelHeader
        title={t("goTogether:card.title")}
        body={t("goTogether:card.body")}
      />
      {/* The value of `PREVIEW_ALLOW_ATTRIBUTE`. The form's choices are
          radio buttons the click catcher would otherwise swallow, so the
          host could never reach the questions. It writes nothing itself:
          its confirm calls `runGuestAction`. */}
      <div data-preview-allow="">
        <GoTogetherOptInPanel
          variant="optIn"
          hostQuestions={card.hostQuestions}
          isPending={false}
          errorMessage={null}
          confirmLabel={t("goTogether:card.optIn.confirm")}
          onSubmit={runGuestAction}
        />
      </div>
    </GoTogetherCardFrame>
  );
}
