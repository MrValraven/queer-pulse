import { FiPlay } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { safeHref } from "../../shared/lib/safeHref";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { SubprofileKind } from "./api/subprofiles.api";
import {
  feedImportSections,
  supportsFeedImport,
} from "./feedImport/feedImportKinds";
import styles from "./SubprofileItemListen.module.css";

/** The address to play, when the row is a playable episode: an http(s) link
 *  (never `mailto:`) on a persona whose kind can import a feed, in a section a
 *  feed can publish into for that kind. The same rule the Import pane uses
 *  (`feedImportSections`), so what an import writes is what gets a link, and
 *  another kind's section (a performer's appearances) never does. */
function playableHref(
  item: SubprofileItemView,
  kind: SubprofileKind | undefined,
): string | null {
  if (!kind || !supportsFeedImport(kind)) return null;
  if (!feedImportSections(kind).includes(item.section)) return null;
  const href = safeHref(item.url);
  return href !== null && /^https?:\/\//i.test(href) ? href : null;
}

/**
 * The "Listen" action on an episode row ("Watch" for a video creator). On the
 * live page it is a real link that opens the episode in a new tab
 * (`noopener noreferrer`), and its accessible name carries the episode title
 * so a list of them is not a column of identical links. In the editor's docked
 * preview (`interactive === false`) it is the same disabled button the hero
 * actions use there. Renders nothing for a row without a playable link.
 */
export function SubprofileItemListen({
  item,
  kind,
  interactive,
}: {
  item: SubprofileItemView;
  kind: SubprofileKind | undefined;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const href = playableHref(item, kind);
  if (href === null) return null;

  const isVideo = kind === "video_creator";
  const label = (
    <>
      <FiPlay aria-hidden />{" "}
      {t(
        isVideo
          ? "subprofiles:feedImport.watch"
          : "subprofiles:feedImport.listen",
      )}
    </>
  );

  if (!interactive) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled
        className={styles.listen}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.listen}
      aria-label={t(
        isVideo
          ? "subprofiles:feedImport.watchAria"
          : "subprofiles:feedImport.listenAria",
        { title: item.title },
      )}
    >
      {label}
    </Button>
  );
}
