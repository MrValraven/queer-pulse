import { m, useIsPresent } from "motion/react";
import { useId } from "react";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Avatar, Button, Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileFollow } from "../subprofiles/SubprofileFollow";
import type { StudioSupportingView } from "./api/studioListening.adapters";
import { useSetSupportingFollow } from "./api/useStudioListening";
import { useRemoveStudioSupporter } from "./api/useStudioSupporter";
import { StudioExternalLinkList } from "./StudioExternalLinkList";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
  studioStaggerDelay,
} from "./studioMotion";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import styles from "./StudioListeningLists.module.css";

const AVATAR_SIZE = 48;

/** One artist the listener supports: who they are, how that artist sees
 *  the listener, since when, the artist's support links, Follow and Stop
 *  supporting. The row's link carries `data-supporting-link`, so the list
 *  can move focus onto it after a removal. */
export function StudioListeningSupportingRow({
  supporting,
  index,
  onRemoved,
}: {
  supporting: StudioSupportingView;
  index: number;
  /** After the artist's opt-in is turned off, before the row leaves. */
  onRemoved: (artistId: string, index: number, artistName: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const setSupportingFollow = useSetSupportingFollow();
  const { artist, shownAs, since, supportLinks, isFollowing } = supporting;
  const { remove, isRemoving, error } = useRemoveStudioSupporter(artist.id);
  const errorId = useId();
  const hasFailed = Boolean(error) && !isRemoving;
  const collapsed = { opacity: 0, height: 0, overflow: "hidden" } as const;
  return (
    <m.li
      className={styles.row}
      data-supporting-id={artist.id}
      inert={!isPresent}
      initial={collapsed}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          ...STUDIO_DISCLOSURE,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE.duration,
          delay: reducedMotion ? 0 : studioStaggerDelay(index),
        },
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        ...collapsed,
        transition: {
          ...STUDIO_DISCLOSURE_EXIT,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE_EXIT.duration,
        },
      }}
    >
      <div className={styles.supportingInner}>
        <Avatar
          className={styles.avatar}
          initials={artist.initials}
          tint={artist.tint}
          src={artist.avatarUrl ?? undefined}
          size={AVATAR_SIZE}
        />
        <div className={styles.text}>
          <Link
            to={artist.href}
            className={styles.name}
            data-supporting-link=""
          >
            {artist.name}
          </Link>
          <p className={styles.meta}>
            {t("studio:listening.supporting.shownAs", { name: shownAs.name })}
          </p>
          <p className={styles.meta}>
            {t("studio:listening.supporting.since", {
              date: fmt.date(since, { dateStyle: "medium" }),
            })}
          </p>
          {supportLinks.length > 0 && (
            <div className={styles.links}>
              <StudioExternalLinkList
                links={supportLinks}
                label={t("studio:listening.supporting.linksLabel", {
                  name: artist.name,
                })}
              />
            </div>
          )}
        </div>
        <div className={styles.actions}>
          {/* The count feeds only the follow cache: live answers with its
              own, and the demo reads its registry, so 0 is safe here. */}
          <SubprofileFollow
            subprofileId={artist.id}
            followerCount={0}
            viewerFollowing={isFollowing}
            isOwnerViewing={false}
            onFollowResult={(result) =>
              setSupportingFollow(artist.id, result.viewerFollowing)
            }
          />
          {/* A press while the removal runs does nothing. */}
          <Button
            variant="quiet"
            size="sm"
            aria-label={t("studio:listening.supporting.stopAria", {
              artist: artist.name,
            })}
            aria-busy={isRemoving || undefined}
            aria-describedby={hasFailed ? errorId : undefined}
            onClick={() => {
              if (isRemoving) return;
              void remove().then((isRemoved) => {
                if (isRemoved) onRemoved(artist.id, index, artist.name);
              });
            }}
          >
            {t("studio:listening.supporting.stop")}
          </Button>
        </div>
      </div>
      <Collapse isOpen={hasFailed}>
        <StudioStopSupportingError id={errorId} error={error} />
      </Collapse>
    </m.li>
  );
}

/** Why turning the opt-in off failed. The row stays in the list. */
function StudioStopSupportingError({
  id,
  error,
}: {
  id: string;
  error: unknown;
}) {
  const { t } = useTranslation();
  const reasonKey = studioReasonCopyKey(studioReasonOf(error), "save");
  return (
    <p id={id} role="alert" className={styles.rowError}>
      {`${t("studio:supporter.removeFailed")}. ${t(reasonKey)}`}
    </p>
  );
}
