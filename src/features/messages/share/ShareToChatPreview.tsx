import { useEffect, useId, useMemo } from "react";
import { Avatar } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMessageLinkCard } from "../api/useMessageLinkCard";
import type { Conversation } from "../data";
import { MessageLinkCard } from "../MessageLinkCard";
import { firstLinkUrl, renderWithLinks } from "../linkify";
import { resolveChatPlaceLink } from "../chatPlaceLink";
import { useWallpaper } from "../wallpaper";
import styles from "./ShareToChatPreview.module.css";

export type ShareRecipient = Pick<
  Conversation,
  "id" | "name" | "avatarUrl" | "initials" | "tint"
>;

export interface ShareToChatPreviewProps {
  /** The picked conversations, in the order they were picked. */
  recipients: ShareRecipient[];
  /** The exact body Send will post (`buildShareBody`), so the preview can
   *  never show something other than what lands in the thread. */
  body: string;
}

/**
 * The right-hand column of `ShareToChatModal`: who the message goes to, and
 * the sent bubble as it will read in the chat once it lands, updating live as
 * the note is typed.
 *
 * The bubble mirrors `TextBubble`'s own rules (MessageBubbleBody.tsx) on the
 * same `useMessageLinkCard` + `MessageLinkCard` pair: a link-only body shows
 * just the card once it resolves (the real directory place card for a shared
 * QueerPulse place link, the ordinary OpenGraph unfurl otherwise), and a body
 * with a note shows the card above the note. A resolved place link mirrors
 * `PlaceShareBubble` too: the card stands on its own with no plum frame
 * around it, and the note (if any) sits in its own small caption bubble
 * directly under it, styled like `.attachmentCaptionSent`; every other link
 * keeps today's single plum bubble with the OG card and note together.
 * Styling is a local miniature, following `WallpaperPreview`, so the real
 * bubble classes (avatars, receipts, reaction slots) stay out of this chunk.
 *
 * The surface is `inert` because the card and the inline link are real
 * anchors: here they are a picture of the message, and a click or Tab stop on
 * them would lead away from the half-written share.
 */
export function ShareToChatPreview({
  recipients,
  body,
}: ShareToChatPreviewProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const wallpaper = useWallpaper(undefined);

  // The pattern tiles live in a route-local sheet that only the Messages chunk
  // imports statically. Fetching it on demand keeps its weight off every
  // article and directory page that carries a share button, while still
  // painting the member's own wallpaper once the modal is open.
  useEffect(() => {
    void import("../chat-wallpaper.css");
  }, []);

  const previewUrl = firstLinkUrl(body);
  const linkCard = useMessageLinkCard(previewUrl);
  // Same swap `TextBubble` applies (MessageBubbleBody.tsx), through the same
  // `resolveChatPlaceLink` helper, so a place share's live preview can never
  // show the raw URL a moment before the real sent bubble drops it.
  // `linkCard` itself is a fresh object every render (a React Query result);
  // only its `placeSlug`/`place` fields decide what `resolveChatPlaceLink`
  // returns.
  const placeLink = useMemo(
    () => resolveChatPlaceLink(previewUrl, linkCard),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewUrl, linkCard.placeSlug, linkCard.place],
  );
  const trimmedBody = body.trim();
  const isLinkOnlyMessage =
    !!previewUrl &&
    (trimmedBody === previewUrl || `https://${trimmedBody}` === previewUrl);
  const isPreviewResolved = !linkCard.isLoading && linkCard.hasContent;
  const shouldRenderText = !(isLinkOnlyMessage && isPreviewResolved);

  return (
    <section className={styles.preview} aria-labelledby={labelId}>
      <h4 id={labelId} className={styles.label}>
        {t("messages:share.previewLabel")}
      </h4>
      <div className={styles.toRow}>
        <span className={styles.toLabel}>{t("messages:share.previewTo")}</span>
        {recipients.length === 0 ? (
          <span className={styles.toEmpty}>
            {t("messages:share.previewEmptyRecipients")}
          </span>
        ) : (
          <ul className={styles.chips}>
            {recipients.map((recipient) => (
              <li key={recipient.id} className={styles.chip}>
                <Avatar
                  initials={recipient.initials}
                  tint={recipient.tint}
                  src={recipient.avatarUrl}
                  alt=""
                  size={20}
                />
                <span className={styles.chipName}>{recipient.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div
        className={styles.surface}
        data-wallpaper-pattern={wallpaper.pattern}
        inert
      >
        {placeLink ? (
          <>
            <div className={styles.placeGroup}>
              <MessageLinkCard url={placeLink.url} state={linkCard} isSent />
              {shouldRenderText && (
                <div className={styles.placeCaption}>
                  {renderWithLinks(body, placeLink)}
                </div>
              )}
            </div>
            <span className={styles.placeTime}>
              {t("messages:share.previewTime")}
            </span>
          </>
        ) : (
          <div className={styles.bubble}>
            {previewUrl && (
              <MessageLinkCard url={previewUrl} state={linkCard} isSent />
            )}
            {shouldRenderText && (
              <span className={styles.text}>
                {renderWithLinks(body, placeLink)}
              </span>
            )}
            <span className={styles.time}>
              {t("messages:share.previewTime")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
