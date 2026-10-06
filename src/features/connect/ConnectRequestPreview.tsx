import { useId, type ComponentProps } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { tintForSlug } from "../../shared/api/refs";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentUserSlug } from "../members/data/demoCurrentUser";
import { ConnectForm } from "./ConnectForm";
import { IncomingCard } from "./ConnectionCards";
import type { ConnectionView } from "./connections.data";
import modalStyles from "./ConnectModal.module.css";
import styles from "./ConnectRequestPreview.module.css";

/**
 * The width at which the dialog has room for the form and the preview. Keep it
 * identical to the `.previewLayout` media query in ConnectModal.module.css.
 */
const PREVIEW_LAYOUT_QUERY = "(min-width: 1040px)";

/**
 * The sender, shaped as the card view the recipient's Connections page builds
 * for an incoming request. There is no role or headline for yourself, so the
 * secondary line is just your pronouns. The slug drives the same per-slug
 * avatar tint and staff badge the recipient sees; the identity itself comes
 * from `useAccountIdentity`, which is already demo/live safe.
 */
function useSenderView(reason: string, message: string): ConnectionView {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const identity = useAccountIdentity();
  const slug = user?.profile?.slug ?? (demoMode ? currentUserSlug : "");
  return {
    slug,
    name: identity.name,
    initials: identity.initials,
    tint: slug ? tintForSlug(slug) : "default",
    photo: identity.photo,
    role: "",
    pron: identity.pronouns,
    tags: [],
    meta: {
      requestMessage: message.trim() || undefined,
      requestReason: reason || undefined,
      sentAgo: t("connect:ago.justNow"),
    },
  };
}

/**
 * The request exactly as the recipient will receive it, rebuilt on every
 * keystroke. A labelled region with no live announcement: the person typing
 * already knows what they typed, so a screen reader stays quiet until they go
 * looking for it.
 */
function ConnectRequestPreview({
  recipientFirstName,
  reason,
  message,
}: {
  recipientFirstName: string;
  reason: string;
  message: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const senderView = useSenderView(reason, message);
  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("connect:preview.heading", { first: recipientFirstName })}
      </h2>
      <IncomingCard view={senderView} isPreview />
    </section>
  );
}

/**
 * The connect modal's form state. On a wide screen the dialog grows into two
 * columns, the form on the left and the live preview on the right; anywhere
 * narrower the preview never mounts. The wrapper renders at every width (its
 * grid only applies inside the same 1040px query in ConnectModal.module.css),
 * so the form keeps its place in the tree and its state when the window
 * crosses the breakpoint.
 */
export function ConnectFormLayout(props: ComponentProps<typeof ConnectForm>) {
  const isWide = useMediaQuery(PREVIEW_LAYOUT_QUERY);
  return (
    <div className={modalStyles.previewLayout}>
      <ConnectForm {...props} />
      {isWide && (
        <ConnectRequestPreview
          recipientFirstName={props.member.first}
          reason={props.reason}
          message={props.message}
        />
      )}
    </div>
  );
}
