import { lazy, Suspense, type ReactElement } from "react";
import { ErrorBoundary } from "../../../shared/components/feedback/ErrorBoundary";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import { detectLanguage } from "../../../shared/i18n/locale";
import {
  StudioShareCardFrame,
  StudioShareCardPlaceholder,
  StudioShareCardUnavailable,
} from "./StudioShareCardFrame";
import type { StudioShareCardProps } from "./studioShareCard.types";
import { studioShareTargetKey } from "./studioLinkTarget";

export type { StudioShareCardProps } from "./studioShareCard.types";

// The card, its Studio reads and the player wiring load the first time a
// card mounts (the same posture as MessageLinkCard's PlaceLinkCardBody).
// The `studio` namespace loads alongside, in the language the provider
// starts from, so the card's first paint carries its copy. A namespace that
// fails to load leaves the card to the provider's own EN fallback.
const StudioShareCard = lazy(() =>
  Promise.all([
    import("./StudioShareCard"),
    loadNamespace(detectLanguage(), "studio").catch(() => undefined),
  ]).then(([module]) => ({ default: module.StudioShareCard })),
);

/** The contract's card entry point: the fallback is the card's own fixed
 *  frame, so nothing moves when the chunk arrives. A chunk that fails to load
 *  (lazy chunks are left out of the precache) or a card that throws paints
 *  the unavailable notice in that same frame, so the chat, feed or post
 *  around it stays on screen. */
export function LazyStudioShareCard(props: StudioShareCardProps): ReactElement {
  const { target, surface, onRemove } = props;
  return (
    <ErrorBoundary
      level="route"
      resetKey={studioShareTargetKey(target)}
      fallback={() => (
        <StudioShareCardFrame
          surface={surface}
          kind={target.kind}
          onRemove={onRemove}
        >
          <StudioShareCardUnavailable />
        </StudioShareCardFrame>
      )}
    >
      <Suspense
        fallback={
          <StudioShareCardFrame
            surface={surface}
            kind={target.kind}
            onRemove={onRemove}
          >
            <StudioShareCardPlaceholder />
          </StudioShareCardFrame>
        }
      >
        <StudioShareCard {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
