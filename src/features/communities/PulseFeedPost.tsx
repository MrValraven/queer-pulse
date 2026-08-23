import { FiVolume2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Post } from "./community.model";
import { PulsePost } from "./PulsePost";
import styles from "./PulseTab.module.css";

type PulsePostProps = Omit<
  Parameters<typeof PulsePost>[0],
  "post" | "isPinned"
>;

/**
 * One row of the Pulse feed: an ordinary post, or an announcement in its own
 * accent frame.
 *
 * The accent pill matches `HubPulseCard`'s announcement badge, which is the
 * language the platform already speaks for this exact thing, so the aggregated
 * hub feed and a community's own feed mark an announcement the same way. The
 * card underneath picks up the same accent so the mark reads as belonging to
 * the post rather than floating above it.
 *
 * An announcement is auto-pinned server-side, so it arrives in the pinned
 * section. It is rendered with `isPinned` off on purpose: the generic "pinned"
 * flag and the announcement pill would otherwise stack two labels for one
 * fact, and the announcement is the more specific of the two.
 */
export function PulseFeedPost({
  post,
  isPinned = false,
  postProps,
}: {
  post: Post;
  isPinned?: boolean;
  postProps: PulsePostProps;
}) {
  const { t } = useTranslation();

  if (post.kind !== "announcement") {
    return <PulsePost post={post} isPinned={isPinned} {...postProps} />;
  }

  return (
    <div className={styles.announcement}>
      <div className={styles.announcementFlag}>
        <FiVolume2 aria-hidden />
        {t("communities:detail.pulse.announcement.flag")}
      </div>
      <PulsePost post={post} {...postProps} />
    </div>
  );
}
