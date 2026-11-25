import type { CSSProperties } from "react";
import { PageShell } from "../../shared/components/layout";
import {
  SkeletonAvatar,
  SkeletonBlock,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import pageStyles from "./DirectorySpacePage.module.css";
import skeletonStyles from "./DirectorySpaceSkeleton.module.css";

/** The gallery holds a hero and up to three thumbnails beside it. */
const MAX_THUMB_COUNT = 3;
/** A listing still in flight has an unknown photo count: a hero and two. */
const DEFAULT_PHOTO_COUNT = 3;
/** The header's icon actions (directions, share, save) on a visitor's view. */
const ACTION_COUNT = 3;

interface Props {
  /** Photos the gallery will show, once the listing is known. */
  photoCount?: number;
  /** How long the skeleton stays invisible before it fades in, so a load that
   *  settles within it shows nothing at all. */
  graceMs: number;
}

/**
 * The directory detail page drawn as quiet shimmer blocks while the listing
 * and its photos load. It is built from the real page's own layout classes
 * (cover, identity header, gallery split, body grid, rail), so each block sits
 * where the content it stands for will land and the swap moves nothing.
 *
 * It mirrors the page a visitor sees. Moderator and owner chrome (the plum
 * band, the owner card, "Reposition photos") depends on who is looking, so it
 * arrives with the real page.
 */
export function DirectorySpaceSkeleton({
  photoCount = DEFAULT_PHOTO_COUNT,
  graceMs,
}: Props) {
  const { t } = useTranslation();
  const graceStyle = { "--skeleton-grace": `${graceMs}ms` } as CSSProperties;
  return (
    <PageShell>
      <div
        className={skeletonStyles.skeleton}
        style={graceStyle}
        role="status"
        aria-busy="true"
      >
        <span className="visuallyHidden">
          {t("marketing:directory.detail.loadingLabel")}
        </span>
        <div aria-hidden="true">
          <SkeletonBreadcrumb />
          <SkeletonHeader />
          <SkeletonGallery photoCount={photoCount} />
          <SkeletonBody />
        </div>
      </div>
    </PageShell>
  );
}

function SkeletonBreadcrumb() {
  return (
    <div className={pageStyles.coverHead}>
      <div className={pageStyles.coverInner}>
        <div className={pageStyles.coverTop}>
          <div
            className={[pageStyles.breadcrumb, skeletonStyles.crumbRow].join(
              " ",
            )}
          >
            <SkeletonLine width={220} height="60%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className={pageStyles.identity}>
      <div className={pageStyles.coverInner}>
        <div className={pageStyles.spaceHead}>
          <div className={pageStyles.spaceHeadIdentity}>
            <div className={skeletonStyles.eyebrowRow}>
              <SkeletonLine width="34%" height="64%" />
            </div>
            <div className={skeletonStyles.nameRow}>
              <SkeletonLine width="52%" height="78%" />
            </div>
            <div className={skeletonStyles.taglineRow}>
              <SkeletonLine width="48%" height="62%" />
            </div>
            {/* A phone wraps the tagline onto a second line. */}
            <div className={skeletonStyles.taglineWrapRow}>
              <SkeletonLine width="36%" height="62%" />
            </div>
            <div className={skeletonStyles.metaRow}>
              <SkeletonBlock className={skeletonStyles.pill} />
              <SkeletonBlock className={skeletonStyles.pillShort} />
              <SkeletonBlock className={skeletonStyles.pillWide} />
            </div>
            <div className={skeletonStyles.bylineRow}>
              <SkeletonAvatar size={24} />
              <SkeletonLine width="40%" height="54%" />
            </div>
          </div>
          <div className={pageStyles.spaceHeadActions}>
            <div className={skeletonStyles.actions}>
              {Array.from({ length: ACTION_COUNT }, (_, index) => (
                <SkeletonAvatar key={index} size={44} />
              ))}
            </div>
          </div>
          <div className={pageStyles.description}>
            <SkeletonParagraph lastLineWidth="72%" />
            <SkeletonParagraph lastLineWidth="58%" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Two body-copy lines on the real 16px / 1.7 rhythm. Each paragraph is one
 *  child of `.description`, which spaces its children the way it spaces the
 *  owner's real paragraphs. */
function SkeletonParagraph({ lastLineWidth }: { lastLineWidth: string }) {
  return (
    <div>
      <div className={skeletonStyles.textRow}>
        <SkeletonLine width="100%" height="52%" />
      </div>
      <div className={skeletonStyles.textRow}>
        <SkeletonLine width={lastLineWidth} height="52%" />
      </div>
    </div>
  );
}

function SkeletonGallery({ photoCount }: { photoCount: number }) {
  const thumbCount = Math.min(Math.max(photoCount - 1, 0), MAX_THUMB_COUNT);
  return (
    <div className={pageStyles.cover}>
      <div className={pageStyles.coverInner}>
        <div
          className={[
            skeletonStyles.gallery,
            thumbCount === 0 && skeletonStyles.galleryFull,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <SkeletonBlock className={skeletonStyles.hero} />
          {thumbCount > 0 && (
            <div className={skeletonStyles.thumbs}>
              {Array.from({ length: thumbCount }, (_, index) => (
                <SkeletonBlock key={index} className={skeletonStyles.thumb} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** A section heading and the quiet subline under it. */
function SkeletonSectionHead({ headingWidth }: { headingWidth: string }) {
  return (
    <>
      <div className={skeletonStyles.headingRow}>
        <SkeletonLine width={headingWidth} height="62%" />
      </div>
      <div className={skeletonStyles.subLineRow}>
        <SkeletonLine width="56%" height="48%" />
      </div>
    </>
  );
}

function SkeletonBody() {
  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.grid}>
        <div>
          <div className={pageStyles.sec}>
            <SkeletonSectionHead headingWidth="38%" />
            <div className={skeletonStyles.chipRows}>
              {["62%", "78%", "46%"].map((width) => (
                <div key={width} className={skeletonStyles.chipRow}>
                  <SkeletonLine width={width} height={30} />
                </div>
              ))}
            </div>
          </div>
          <div className={pageStyles.sec}>
            <SkeletonSectionHead headingWidth="24%" />
            <div
              className={[pageStyles.hoursCard, skeletonStyles.card].join(" ")}
            >
              {["44%", "52%", "48%", "56%", "40%", "50%"].map((width) => (
                <div key={width} className={skeletonStyles.cardRow}>
                  <SkeletonLine width={width} height="44%" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={pageStyles.side}>
          <div className={pageStyles.sec}>
            <SkeletonSectionHead headingWidth="58%" />
            <div
              className={[pageStyles.visitCard, skeletonStyles.visitCard].join(
                " ",
              )}
            >
              <SkeletonBlock className={skeletonStyles.map} />
              <div className={skeletonStyles.visitBody}>
                <SkeletonLine width="72%" height={14} />
                <SkeletonLine width="48%" height={14} />
                <div className={skeletonStyles.visitButtons}>
                  <SkeletonBlock className={skeletonStyles.button} />
                  <SkeletonBlock className={skeletonStyles.button} />
                </div>
                {["64%", "52%", "70%", "46%", "58%"].map((width) => (
                  <div key={width} className={skeletonStyles.contactRow}>
                    <SkeletonLine width={width} height={14} />
                  </div>
                ))}
                <SkeletonBlock className={skeletonStyles.cta} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
