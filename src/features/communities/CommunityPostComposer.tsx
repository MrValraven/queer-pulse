import { useRef, type CSSProperties, type ReactNode } from "react";
import { FiImage, FiX } from "react-icons/fi";
import { Avatar, Button, IconButton, Toggle } from "../../shared/components/ui";
import type { ButtonVariant } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { StudioComposerPreview } from "../studio/share/StudioComposerPreview";
import { CommunityComposerBody } from "./CommunityComposerBody";
import type { Person } from "./communityDetails";
import { photoOf } from "./communityPeople";
import type { usePostImageAttach } from "./usePostImageAttach";
import { useFocusWhenRequested } from "./useComposerFocusRequest";
import styles from "./CommunityPostComposer.module.css";

export type PostImageAttach = ReturnType<typeof usePostImageAttach>;

/** The composer's announcement switch, passed ONLY by callers whose viewer may
 *  actually post one (owner, co-owner, moderator). Absent for everybody else,
 *  so an ordinary member never sees a control the server would refuse. */
export interface ComposerAnnouncementToggle {
  isOn: boolean;
  onToggle: (isOn: boolean) => void;
}

/**
 * The one "write something here" box the community hub uses, shared by the
 * Pulse feed and the Discussion tab. Both used to hand-roll the same avatar +
 * textarea + attach-an-image + send row, which is why the two drifted (one
 * showed the viewer's real face, the other a hardcoded "Me" chip) and why the
 * file-picker markup existed twice.
 *
 * Presentation stays with the caller: the row and textarea classes come from
 * whichever tab is rendering, so neither surface changes shape. The image
 * attach affordances live here, since they were byte-identical, and so does
 * the body: `CommunityComposerBody` gives both tabs the forum's formatting
 * toolbar, a field that grows with the post, and a Write | Preview switch.
 */
export function CommunityPostComposer({
  viewer,
  avatarSize = 38,
  className,
  style,
  textareaClassName,
  placeholder,
  value,
  onChange,
  onSubmit,
  submitLabel,
  submitVariant = "primary",
  submitIcon,
  submitStyle,
  attach,
  announcement,
  isFocusRequested,
  onFocusHandled,
}: {
  /** The signed-in member, so the composer shows their own name and face.
   *  `null` while the session is still resolving. */
  viewer: Person | null;
  avatarSize?: number;
  /** The composer row's own class, from the calling tab's CSS module. */
  className: string | undefined;
  /** Spacing the calling tab owns (the row itself is layout-agnostic). */
  style?: CSSProperties;
  textareaClassName: string | undefined;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  submitVariant?: ButtonVariant;
  submitIcon?: ReactNode;
  submitStyle?: CSSProperties;
  attach: PostImageAttach;
  /** Lets the viewer send this as an announcement. Omit to hide the switch. */
  announcement?: ComposerAnnouncementToggle;
  /** True when a link asked for this composer to take focus on arrival. */
  isFocusRequested?: boolean;
  /** Called once the field has been scrolled into view and focused. */
  onFocusHandled?: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  useFocusWhenRequested(fieldRef, isFocusRequested === true, onFocusHandled);
  const {
    image,
    uploading: isUploading,
    error,
    inputRef,
    handleFile,
    remove,
    openPicker,
  } = attach;

  return (
    <div
      className={[className, styles.root].filter(Boolean).join(" ")}
      style={style}
    >
      <div className={styles.avatarSlot}>
        <Avatar
          initials={viewer?.initials ?? "?"}
          tint={viewer?.tint ?? "plum"}
          src={viewer ? photoOf(viewer, demoMode) : undefined}
          size={avatarSize}
          alt={viewer?.name ?? ""}
        />
      </div>
      <div className={styles.field}>
        <CommunityComposerBody
          textareaRef={fieldRef}
          textareaClassName={textareaClassName}
          ariaLabel={placeholder}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <StudioComposerPreview
          text={value}
          onTextChange={onChange}
          fieldRef={fieldRef}
        />
        {image && (
          <div className={styles.stagedImage}>
            <img src={image.previewUrl} alt="" />
            <IconButton
              className={styles.stagedImageRemove}
              size="sm"
              aria-label={t("communities:common.removeImageAria")}
              onClick={remove}
            >
              <FiX aria-hidden />
            </IconButton>
          </div>
        )}
        {error && (
          <p className={styles.imageAttachError} role="alert">
            {error}
          </p>
        )}
        {announcement && (
          <div className={styles.announcementRow}>
            <Toggle
              checked={announcement.isOn}
              onChange={announcement.onToggle}
              label={t("communities:detail.pulse.announcement.toggleAria")}
              tone="coral"
            />
            <span className={styles.announcementText}>
              <span className={styles.announcementTitle}>
                {t("communities:detail.pulse.announcement.toggleLabel")}
              </span>
              {/* Says what the switch does BEFORE it is used: an announcement
                  is pinned and it pages the roster, which nobody should learn
                  about after the fact. */}
              <span className={styles.announcementHint}>
                {t("communities:detail.pulse.announcement.toggleHint")}
              </span>
            </span>
          </div>
        )}
      </div>
      {/* Attach + send travel together so a phone can drop the pair onto its
          own line, which leaves the field (and with it the announcement
          switch) the full width of the card. */}
      <div className={styles.actions}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenFileInput}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
          }}
        />
        <IconButton
          className={styles.attachImageBtn}
          aria-label={t("communities:common.attachImageAria")}
          disabled={isUploading}
          onClick={openPicker}
        >
          <FiImage aria-hidden />
        </IconButton>
        <Button
          variant={submitVariant}
          onClick={onSubmit}
          style={{ whiteSpace: "nowrap", ...submitStyle }}
        >
          {submitIcon}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
