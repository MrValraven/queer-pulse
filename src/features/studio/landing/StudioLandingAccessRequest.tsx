import { useRef, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiClock } from "react-icons/fi";
import {
  Button,
  CheckLine,
  Collapse,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioLandingAudience } from "./studioLanding.data";
import { StudioLandingAccessRequestCompact } from "./StudioLandingAccessRequestCompact";
import {
  useFocusOnArrival,
  useStudioLandingAccessActions,
} from "./useStudioLandingAccessActions";
import styles from "./StudioLandingCta.module.css";

interface StudioLandingAccessRequestProps {
  placement: "hero" | "closing" | "artists";
  audience: StudioLandingAudience;
}

/**
 * A signed-in member without Studio access: the request that puts them on
 * our team's "Waiting for Studio" list, read from GET /studio/me. The hero
 * holds the full block; the For artists section posts as an artist and the
 * closing posts the audience, both in the compact form.
 */
export function StudioLandingAccessRequest({
  placement,
  audience,
}: StudioLandingAccessRequestProps) {
  if (placement === "hero") return <HeroAccessRequest audience={audience} />;
  return (
    <StudioLandingAccessRequestCompact
      placement={placement}
      wantsToRelease={placement === "artists" || audience === "artist"}
    />
  );
}

/**
 * The hero's full member block. Each state (checking, no request, on the
 * list) folds in and out in its own Collapse, and an always-mounted status
 * region speaks a sent or cancelled request. The button pressed folds away
 * with its state, so focus moves to the on-list title after sending and to
 * "Request Studio access" after cancelling. "I make music" starts ticked for
 * the artist audience and follows the switch until the member ticks or
 * unticks it themselves.
 */
function HeroAccessRequest({ audience }: { audience: StudioLandingAudience }) {
  const { t } = useTranslation();
  const actions = useStudioLandingAccessActions();
  const { isChecking, isOnList, hasNoRequest, requestFailure, cancelFailure } =
    actions;
  const [chosenWantsToRelease, setChosenWantsToRelease] = useState<
    boolean | null
  >(null);
  const wantsToRelease = chosenWantsToRelease ?? audience === "artist";
  const onListTitleRef = useRef<HTMLParagraphElement>(null);
  const requestButtonRef = useRef<HTMLButtonElement>(null);
  useFocusOnArrival(actions, "onList", isOnList, onListTitleRef);
  useFocusOnArrival(actions, "request", hasNoRequest, requestButtonRef);

  return (
    <div className={`${styles.access} ${styles.accessStart}`}>
      <Collapse isOpen={isChecking}>
        <div className={styles.checking}>
          <SkeletonLine width={36} height={10} />
          <span>{t("studio:landing.cta.checking")}</span>
        </div>
      </Collapse>
      <Collapse isOpen={hasNoRequest}>
        <div className={styles.requestBlock}>
          <p className={styles.memberNote}>
            <FiClock aria-hidden="true" className={styles.noteIcon} />
            {t("studio:landing.cta.memberNote")}
          </p>
          <div className={styles.makesMusic}>
            <CheckLine
              checked={wantsToRelease}
              onChange={setChosenWantsToRelease}
              title={t("studio:landing.cta.makesMusic")}
            />
          </div>
          <Button
            ref={requestButtonRef}
            variant="primary"
            size="lg"
            onClick={() => actions.sendRequest(wantsToRelease)}
            aria-busy={actions.isRequestPending || undefined}
          >
            {t("studio:landing.cta.requestAccess")}
            <FiArrowRight aria-hidden="true" />
          </Button>
          <Collapse isOpen={requestFailure !== null}>
            <p role="alert" className={styles.failure}>
              {requestFailure}
            </p>
          </Collapse>
        </div>
      </Collapse>
      <Collapse isOpen={isOnList}>
        <div className={styles.onList}>
          <FiCheckCircle aria-hidden="true" className={styles.onListIcon} />
          <div className={styles.onListCopy}>
            <p
              ref={onListTitleRef}
              tabIndex={-1}
              className={styles.onListTitle}
            >
              {t("studio:landing.cta.onList.title")}
            </p>
            <p className={styles.onListBody}>
              {actions.isArtistRequest
                ? t("studio:landing.cta.onList.artistBody")
                : t("studio:landing.cta.onList.body")}
            </p>
            <Button
              variant="ghost"
              onClick={actions.cancel}
              aria-busy={actions.isCancelPending || undefined}
            >
              {t("studio:landing.cta.cancelRequest")}
            </Button>
            <Collapse isOpen={cancelFailure !== null}>
              <p role="alert" className={styles.failure}>
                {cancelFailure}
              </p>
            </Collapse>
          </div>
        </div>
      </Collapse>
      <p role="status" className="visuallyHidden">
        {actions.announcement}
      </p>
    </div>
  );
}
