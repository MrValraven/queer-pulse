import { FiCheck, FiLink } from "react-icons/fi";
import { useState } from "react";
import { IconButton } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPostUrl } from "./communityPostPath";

/**
 * Copy a Pulse post's permalink to the clipboard, so a member can quote a post
 * inside the walled garden instead of describing where it was.
 *
 * The icon swaps to a tick for two seconds after a successful copy: the toast
 * says what happened, and the button itself confirms it stayed pressed. The
 * accessible name never changes with it, so a screen reader is not handed a
 * control whose name flickers.
 *
 * `navigator.clipboard` is unavailable on an insecure origin and can be
 * refused outright, so the failure path says so rather than silently doing
 * nothing.
 */
export function CopyPostLinkButton({
  communitySlug,
  postId,
  className,
}: {
  communitySlug: string;
  postId: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [hasJustCopied, setHasJustCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        communityPostUrl(communitySlug, postId),
      );
      setHasJustCopied(true);
      window.setTimeout(() => setHasJustCopied(false), 2000);
      showToast(t("communities:detail.pulse.copyLink.copiedToast"), "success");
    } catch {
      showToast(t("communities:detail.pulse.copyLink.failedToast"), "error");
    }
  };

  return (
    <IconButton
      className={className}
      aria-label={t("communities:detail.pulse.copyLink.ariaLabel")}
      title={t("communities:detail.pulse.copyLink.ariaLabel")}
      onClick={() => {
        void copy();
      }}
    >
      {hasJustCopied ? <FiCheck aria-hidden /> : <FiLink aria-hidden />}
    </IconButton>
  );
}
