import { AnimatePresence } from "motion/react";
import { ImageSlot } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useStudioMilestoneCard } from "../api/useStudioMilestoneCard";
import { milestoneSentenceOf } from "../studioMilestoneSentence";
import { StudioShareCardBody } from "./StudioShareCardBody";
import {
  StudioShareCardLayer,
  StudioShareCardStatusBody,
} from "./StudioShareCardStates";
import type { StudioLinkTarget } from "./studioLinkTarget";
import { GRANTED_ACCESS, studioShareCardStatus } from "./studioShareCardModel";

/** A shared milestone: the persona's sentence, up to three lines, as a link
 *  to the artist page. The sentence names the persona, so the card carries
 *  no byline or date line. Nothing plays. Members always read their own
 *  milestone, so the share dialog previews a private persona's card too. */
export function StudioShareMilestoneCard({
  target,
}: {
  target: StudioLinkTarget;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { card, loadState } = useStudioMilestoneCard(target.id);
  const status = studioShareCardStatus(
    GRANTED_ACCESS,
    loadState,
    card !== null,
  );
  let readyBody = null;
  if (status === "ready" && card) {
    const sentence = milestoneSentenceOf(
      card.milestone,
      card.artist.name,
      (value) => formatters.number(value),
    );
    readyBody = (
      <StudioShareCardBody
        kind="milestone"
        href={card.artist.href}
        title={t(sentence.key, sentence.values)}
        titleLines={3}
        art={
          <ImageSlot
            src={card.artist.avatarUrl ?? undefined}
            tint={card.artist.tint}
            width="100%"
            height="100%"
            // The cover box clips to the concentric corner.
            radius={0}
            initials={card.artist.initials}
            placeholder={card.artist.name}
            style={{ position: "absolute", inset: 0 }}
          />
        }
        play={null}
      />
    );
  }
  return (
    <AnimatePresence initial={false}>
      <StudioShareCardLayer key={readyBody ? "ready" : status}>
        {readyBody ?? (
          <StudioShareCardStatusBody
            status={status === "ready" ? "loading" : status}
            loadState={loadState}
          />
        )}
      </StudioShareCardLayer>
    </AnimatePresence>
  );
}
