import { createPortal } from "react-dom";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useRouteTransitionScope } from "../../../../shared/components/layout/routeTransitionScope";
import { IdentityContactButton } from "../../../messages/identityContact/IdentityContactButton";
import { personaTitleName } from "../../subprofile-kinds";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction } from "../../personaSkinRender";
import type { TherapistView } from "./therapistView";
import { TherapistStatusText } from "./TherapistHeroFacts";
import styles from "./TherapistBody.module.css";

interface TherapistMobileBarProps {
  data: PublicSubprofileView;
  view: TherapistView;
  onAction: (action: PersonaAction) => void;
  /** The phone skip link's target. */
  contactId: string;
}

/**
 * The phone action bar: name, capacity and the message button, fixed to
 * the bottom of the screen below 860px (hidden above it by CSS). Mounted
 * for a public visitor only; the hero hides its own message button at the
 * same width, so there is one on screen at a time.
 *
 * Portaled to <body>: `.pp` is a size container, and containment makes it
 * the containing block for fixed descendants, which would pin this bar to
 * the bottom of the persona page instead of the screen. Not portaled from a
 * route that is fading out: that copy of the page is on its way out, and a
 * second bar on <body> would sit on top of the incoming page's.
 */
export function TherapistMobileBar({
  data,
  view,
  onAction,
  contactId,
}: TherapistMobileBarProps) {
  const { t } = useTranslation();
  const transitionScope = useRouteTransitionScope();
  if (transitionScope?.isPresent === false) return null;

  const titleName = personaTitleName({
    displayName: data.displayName,
    kind: data.kind,
    ownerName: data.ownerName,
  });
  const isMessageable = data.status === "published";

  return createPortal(
    <aside
      className={styles.mbar}
      id={contactId}
      aria-label={t("subprofiles:therapist.mobile.label", {
        name: titleName,
      })}
    >
      <div className={styles.mbarWho}>
        <span className={styles.mbarName}>{titleName}</span>
        <span className={styles.mbarStatus}>
          <TherapistStatusText view={view} />
        </span>
      </div>
      {isMessageable && (
        <div className={styles.mbarCta}>
          <IdentityContactButton
            target={{ kind: "persona", subprofileId: data.id }}
            name={data.displayName}
            buttonVariant="primary"
            label={t("subprofiles:therapist.mobile.message")}
            onOpen={() => onAction("message")}
          />
        </div>
      )}
    </aside>,
    document.body,
  );
}
