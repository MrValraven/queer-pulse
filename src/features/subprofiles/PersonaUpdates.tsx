import {
  useEffect,
  useId,
  useRef,
  type FocusEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { Button, Collapse } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isPersonaPostKind } from "./api/personaPosts.types";
import { usePersonaPosts } from "./api/usePersonaPosts";
import { PersonaPostComposer } from "./PersonaPostComposer";
import { PersonaPostList } from "./PersonaPostList";
import type { PersonaViewMode } from "./personaSkinRender";
import styles from "./PersonaUpdates.module.css";

/** The block's frame: a skinned `pp-sec` anchored at `#updates` on the
 *  persona page, or the module's own heading in Studio. */
function UpdatesFrame({
  surface,
  headingId,
  headingRef,
  sectionRef,
  focusTracking,
  children,
}: {
  surface: "persona" | "studio";
  headingId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
  focusTracking: BlockFocusTracking;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (surface === "persona")
    return (
      <section
        ref={sectionRef}
        {...focusTracking}
        id="updates"
        className={`pp-sec ${styles.personaBlock}`}
        data-preview-anchor="section:updates"
        aria-labelledby={headingId}
      >
        <header>
          <h2 id={headingId} ref={headingRef} tabIndex={-1}>
            {t("subprofiles:updates.heading")}
          </h2>
        </header>
        <div className={styles.block}>{children}</div>
      </section>
    );
  return (
    <section
      ref={sectionRef}
      {...focusTracking}
      className={styles.studioBlock}
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={styles.studioHeading}
      >
        {t("subprofiles:updates.heading")}
      </h2>
      <div className={styles.block}>{children}</div>
    </section>
  );
}

/** Where focus goes when the block leaves while it held focus: the tab
 *  panel around it, which stays mounted. */
const FOCUS_FALLBACK = '[role="tabpanel"]';

/** The block's focus listeners. React focus events bubble through portals,
 *  so the delete dialog counts as inside the block. */
interface BlockFocusTracking {
  onFocus: () => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
}

/** Focus care for the block. A "Read the update" link (`/p/<handle>#updates`)
 *  lands before the posts answer, while the block is off the page, so the
 *  first time the block shows for that navigation it scrolls into view and
 *  its heading takes focus; later refetches leave focus alone. When the
 *  block leaves with focus inside it (the owner deleted the only post on a
 *  surface without the composer), focus moves to the tab panel around it. */
function useUpdatesBlockFocus({
  surface,
  isShown,
  sectionRef,
  headingRef,
}: {
  surface: "persona" | "studio";
  isShown: boolean;
  sectionRef: RefObject<HTMLElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const arrivedForKeyRef = useRef<string | null>(null);
  const focusFallbackRef = useRef<HTMLElement | null>(null);
  const hasFocusInsideRef = useRef(false);
  const focusTracking: BlockFocusTracking = {
    onFocus: () => {
      hasFocusInsideRef.current = true;
    },
    // Focus that moves on clears the flag (a focus landing back inside sets
    // it again right after). Focus that drops to the page clears it once
    // the block is still there: a removed block keeps the flag for its
    // fallback.
    onBlur: (event) => {
      if (event.relatedTarget) {
        hasFocusInsideRef.current = false;
        return;
      }
      const section = event.currentTarget;
      queueMicrotask(() => {
        if (section.isConnected && !section.contains(document.activeElement))
          hasFocusInsideRef.current = false;
      });
    },
  };

  useEffect(() => {
    if (!isShown || surface !== "persona" || location.hash !== "#updates")
      return;
    if (arrivedForKeyRef.current === location.key) return;
    arrivedForKeyRef.current = location.key;
    sectionRef.current?.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
    headingRef.current?.focus({ preventScroll: true });
  }, [
    isShown,
    surface,
    location.hash,
    location.key,
    prefersReducedMotion,
    sectionRef,
    headingRef,
  ]);

  useEffect(() => {
    if (isShown) {
      focusFallbackRef.current =
        sectionRef.current?.parentElement?.closest<HTMLElement>(
          FOCUS_FALLBACK,
        ) ?? null;
      return;
    }
    const fallback = focusFallbackRef.current;
    const hadFocusInside = hasFocusInsideRef.current;
    focusFallbackRef.current = null;
    hasFocusInsideRef.current = false;
    const active = document.activeElement;
    const isFocusLost =
      !active || active === document.body || !active.isConnected;
    if (fallback?.isConnected && hadFocusInside && isFocusLost)
      fallback.focus({ preventScroll: true });
  }, [isShown, sectionRef]);

  return focusTracking;
}

/** A musician's or DJ's "Updates": on the persona page (a skinned section,
 *  `#updates`), in the persona editor preview, and in the Studio artist
 *  page, all through the same read. Visitors see nothing while loading,
 *  after a failure or with no posts; the owner sees the block whenever it
 *  holds something to act on (the composer, a retry line or posts). */
export function PersonaUpdates({
  persona,
  mode,
  surface,
  isComposerShown = false,
}: {
  persona: { id: string; kind: string; displayName: string };
  mode: PersonaViewMode;
  surface: "persona" | "studio";
  /** Shows the owner's composer in the block. Pass it wherever the owner
   *  posts from this surface, so an owner with no posts gets the composer
   *  under the heading. */
  isComposerShown?: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isPostKind = isPersonaPostKind(persona.kind);
  const posts = usePersonaPosts(persona.id, { isEnabled: isPostKind });
  const isOwner = mode === "owner";
  const isComposerVisible = isOwner && isComposerShown;
  const isRetryShown = isOwner && posts.hasFailed;
  const isShown =
    isPostKind && (posts.posts.length > 0 || isComposerVisible || isRetryShown);
  const focusTracking = useUpdatesBlockFocus({
    surface,
    isShown,
    sectionRef,
    headingRef,
  });
  if (!isShown) return null;

  return (
    <UpdatesFrame
      surface={surface}
      headingId={headingId}
      headingRef={headingRef}
      sectionRef={sectionRef}
      focusTracking={focusTracking}
    >
      {isComposerVisible && <PersonaPostComposer subprofileId={persona.id} />}
      <Collapse isOpen={isRetryShown}>
        <div className={styles.retryLine}>
          <p role="alert" className={styles.error}>
            <FiAlertCircle aria-hidden className={styles.errorIcon} />
            {t("subprofiles:updates.loadError")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={posts.isRetrying || undefined}
            onClick={() => {
              if (!posts.isRetrying) posts.retry();
            }}
          >
            {t("subprofiles:updates.retryCta")}
          </Button>
        </div>
      </Collapse>
      <PersonaPostList
        posts={posts}
        subprofileId={persona.id}
        personaName={persona.displayName}
        mode={mode}
        headingRef={headingRef}
      />
    </UpdatesFrame>
  );
}
