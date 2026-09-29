import { useId } from "react";
import type { IconType } from "react-icons";
import { FiHeart, FiRefreshCw, FiShield } from "react-icons/fi";
import { Button } from "../ui/Button";
import {
  SystemStage,
  SystemStageLead,
  SystemStageTitle,
} from "../layout/SystemStage";
import { stageRevealProps } from "../layout/systemStageReveal";
import { Ping } from "../mascot/Ping";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import styles from "./ErrorFallback.module.css";

interface ErrorFallbackProps {
  onReset: () => void;
  /** A server correlation id or monitor event id, shown for support handoff. */
  referenceId?: string | null;
  /** "route" keeps the app frame around it; "app" is the whole-page catch. */
  level?: "app" | "route";
  /** The visitor already pressed "Try again" once and the page broke again,
   *  so the primary action escalates to a full reload. */
  hasRetried?: boolean;
}

interface Assurance {
  id: string;
  Icon: IconType;
  toneClassName: string | undefined;
  titleKey: string;
  bodyKey: string;
}

// Full literal keys on purpose, so the unused-key report can see them.
const ASSURANCES: Assurance[] = [
  {
    id: "safe",
    Icon: FiShield,
    toneClassName: styles.assuranceIconJade,
    titleKey: "shared:feedback.errorFallback.assure.safe.title",
    bodyKey: "shared:feedback.errorFallback.assure.safe.body",
  },
  {
    id: "notYou",
    Icon: FiHeart,
    toneClassName: styles.assuranceIconCoral,
    titleKey: "shared:feedback.errorFallback.assure.notYou.title",
    bodyKey: "shared:feedback.errorFallback.assure.notYou.body",
  },
  {
    id: "retry",
    Icon: FiRefreshCw,
    toneClassName: styles.assuranceIconCream,
    titleKey: "shared:feedback.errorFallback.assure.retry.title",
    bodyKey: "shared:feedback.errorFallback.assure.retry.body",
  },
];

function reloadPage(): void {
  window.location.reload();
}

/** The reassurances, a real list; each row joins the entrance stagger from
 *  `startIndex`. */
function AssuranceList({
  assurances,
  startIndex,
}: {
  assurances: Assurance[];
  startIndex: number;
}) {
  const { t } = useTranslation();
  return (
    <ul className={styles.assurances}>
      {assurances.map(
        ({ id, Icon, toneClassName, titleKey, bodyKey }, index) => (
          <li
            key={id}
            {...stageRevealProps(startIndex + index, styles.assurance)}
          >
            <span
              className={`${styles.assuranceIcon} ${toneClassName ?? ""}`}
              aria-hidden="true"
            >
              <Icon />
            </span>
            <span className={styles.assuranceText}>
              <strong className={styles.assuranceTitle}>{t(titleKey)}</strong>
              <span className={styles.assuranceBody}>{t(bodyKey)}</span>
            </span>
          </li>
        ),
      )}
    </ul>
  );
}

/**
 * The crash screen an ErrorBoundary shows when a render throws. It replaces
 * the broken page outright with the shared plum SystemStage: a calm copy
 * column on the left and Ping on the right in its broken mood, a coral
 * heartbeat that beats, breaks, and keeps trying to get up. Beneath the
 * apology sit three plain reassurances, then recovery actions, so a crash is
 * never a dead end. A failed fetch is a different state and uses
 * LoadErrorState.
 *
 * `level="app"`: the whole app is gone (the boundary sits outside the router),
 * so the stage renders its own `<main>` and a small wordmark, fills the
 * viewport, and every link is a plain `href`.
 *
 * `level="route"`: the host supplies the `<main>` (ErrorBoundary wraps this in
 * PageShell). As the first child of that main, the stage runs up under the
 * floating nav and fills the window between the chrome; nested deeper, it
 * simply flows.
 *
 * On mount the h1 scrolls the page to the top and takes focus, once, so a
 * screen reader starts on the apology. After a failed retry the page renders
 * settled (no entrance), and the hint saying so sits under the lead as the
 * h1's description, so it is heard with the heading.
 */
export function ErrorFallback({
  onReset,
  referenceId,
  level = "app",
  hasRetried = false,
}: ErrorFallbackProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const retryHintId = useId();

  // Once a retry has failed, "a second try usually works" is no longer true,
  // and the retry hint under the lead says what to do next instead.
  const visibleAssurances = hasRetried
    ? ASSURANCES.filter((assurance) => assurance.id !== "retry")
    : ASSURANCES;
  const assuranceStartIndex = 3;
  const afterListIndex = assuranceStartIndex + visibleAssurances.length;
  const contactIndex = afterListIndex + 1;

  return (
    <SystemStage
      level={level}
      labelledBy={headingId}
      eyebrow={t("shared:feedback.errorFallback.eyebrow")}
      visual={<Ping mood="broken" isSettled={hasRetried} />}
      isSettled={hasRetried}
    >
      <SystemStageTitle
        id={headingId}
        describedBy={hasRetried ? retryHintId : undefined}
      >
        <Translation
          i18nKey="shared:feedback.errorFallback.title"
          components={{ em: <em /> }}
        />
      </SystemStageTitle>

      <SystemStageLead>
        {t("shared:feedback.errorFallback.lead")}
      </SystemStageLead>

      {hasRetried && (
        <p id={retryHintId} className={styles.retryHint}>
          {t("shared:feedback.errorFallback.retryHint")}
        </p>
      )}

      <AssuranceList
        assurances={visibleAssurances}
        startIndex={assuranceStartIndex}
      />

      <div {...stageRevealProps(afterListIndex, styles.actions)}>
        {hasRetried ? (
          <Button size="lg" onClick={reloadPage}>
            {t("shared:feedback.errorFallback.reload")}
          </Button>
        ) : (
          <Button size="lg" onClick={onReset}>
            {t("shared:feedback.errorFallback.tryAgain")}
          </Button>
        )}
        {/* Plain `href` on purpose: the app-level ErrorBoundary sits outside
            BrowserRouter, so a router <Link> (`to`) here throws on a null
            NavigationContext and takes the fallback down with it. A full
            reload is the better recovery from a crash anyway. */}
        <Button size="lg" variant="ghost-dark" href={routes.homepage}>
          {t("common:cta.backHome")}
        </Button>
      </div>

      {/* Plain `href` for the same reason as the home button above. */}
      <p {...stageRevealProps(contactIndex, styles.contact)}>
        <a className={styles.contactLink} href={routes.contact}>
          {t("shared:feedback.errorFallback.contact")}
        </a>
      </p>

      {referenceId && (
        <p {...stageRevealProps(contactIndex + 1, styles.reference)}>
          {t("shared:feedback.errorFallback.reference", { referenceId })}
        </p>
      )}
    </SystemStage>
  );
}
