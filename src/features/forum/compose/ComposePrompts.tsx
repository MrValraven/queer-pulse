import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getThreads } from "../api/forum.api";
import { threadToCard } from "../api/forum.adapters";
import { THREADS, type Thread } from "../forum.data";
import { COMPOSE_EASE } from "./composeMotion";
import styles from "./ComposePrompts.module.css";

// ── The empty composer's two ways in ────────────────────────────────────────
// Shown only while BOTH the title and the body are still empty, because the
// hardest part of a first post is the first line and the easiest help is a
// line somebody else is already waiting on.
//
// The first group is real: threads nobody has answered yet, so picking one
// sends the member somewhere their post is genuinely wanted. The second group
// is the fixed sentence-starter list from the prototype, which is content
// rather than data, so it lives here as catalog keys.
//
// The block folds away on the first keystroke and grows back if the draft is
// emptied again, and the unanswered row grows in when its request lands, so
// the title field below glides to its new place.

/** How many unanswered threads the first row offers. */
const UNANSWERED_PROMPT_COUNT = 3;

/** The sentence starters, as catalog keys. Order is the row order. */
const STARTER_KEYS: readonly string[] = [
  "forum:composePage.prompts.starterGp",
  "forum:composePage.prompts.starterRecommendation",
  "forum:composePage.prompts.starterNewInLisbon",
  "forum:composePage.prompts.starterTried",
  "forum:composePage.prompts.starterFlatmates",
];

/** One line the member can start from, and whether it is still unanswered. */
interface ThreadPrompt {
  title: string;
  replyCount: number;
}

export interface ComposePromptsProps {
  /** The draft title. Any text here hides the whole block. */
  title: string;
  /** The draft body. Any text here hides the whole block. */
  body: string;
  /** Seeds the title with the picked line. The page decides what else that
   *  implies (focusing the title, defaulting the kind to a question). */
  onPickPrompt: (title: string) => void;
}

export function ComposePrompts({
  title,
  body,
  onPickPrompt,
}: ComposePromptsProps) {
  const { t } = useTranslation();
  // Whitespace alone is still an empty composer; a member who typed a space
  // has not started.
  const hasStarted = !!title.trim() || !!body.trim();
  const threadPrompts = useUnansweredThreadPrompts(!hasStarted);
  const { reducedMotion } = useMotionPrefs();

  // Collapse's own height + fade, plus the -8px pull-up under the kind chips,
  // which animates with it: a margin left on a folded block would snap the
  // title field by 8px in the frame the block unmounts.
  return (
    <AnimatePresence initial={false}>
      {!hasStarted && (
        <m.div
          key="prompts"
          style={{ overflow: "hidden" }}
          initial={{ height: 0, opacity: 0, marginTop: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            marginTop: -8,
            transitionEnd: { overflow: "visible" },
          }}
          exit={{ height: 0, opacity: 0, marginTop: 0, overflow: "hidden" }}
          transition={{
            duration: reducedMotion ? 0 : 0.28,
            ease: COMPOSE_EASE,
          }}
        >
          <div className={styles.prompts}>
            <Collapse
              isOpen={threadPrompts.length > 0}
              className={styles.askingSlot}
            >
              <div className={styles.asking}>
                <p className={styles.label}>
                  {t("forum:composePage.prompts.asking")}
                </p>
                <div className={styles.row}>
                  {threadPrompts.map((prompt) => (
                    <button
                      key={prompt.title}
                      type="button"
                      className={styles.prompt}
                      onClick={() => onPickPrompt(prompt.title)}
                    >
                      {prompt.title}
                      {prompt.replyCount === 0 && (
                        <span className={styles.promptNote}>
                          {t("forum:composePage.prompts.noReplies")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Collapse>
            <p className={styles.label}>
              {t("forum:composePage.prompts.startFrom")}
            </p>
            <div className={styles.row}>
              {STARTER_KEYS.map((starterKey) => (
                <button
                  key={starterKey}
                  type="button"
                  className={styles.prompt}
                  onClick={() => onPickPrompt(t(starterKey))}
                >
                  {t(starterKey)}
                </button>
              ))}
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Threads still waiting for a reply, as starter lines.
 *
 * Its OWN query key, never `["forum-threads", …]`: that is the key the publish
 * mutation invalidates, and reading the list from the composer would have the
 * composer evicting and refetching the forum behind it (the same reasoning as
 * `useSimilarThreads`). `isEnabled` is false the moment the member types, so a
 * composer opened with a seeded title never sends this request at all.
 */
function useUnansweredThreadPrompts(isEnabled: boolean): ThreadPrompt[] {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useQuery<Thread[]>({
    queryKey: ["forum-compose-unanswered", demoMode, language],
    enabled: isEnabled,
    queryFn: async () => {
      if (demoMode) return demoUnansweredThreads();
      const page = await getThreads(undefined, undefined, {
        sort: "unanswered",
      });
      return page.data.map((dto) => threadToCard(dto, t, fmt));
    },
  });

  return (query.data ?? [])
    .slice(0, UNANSWERED_PROMPT_COUNT)
    .map((thread) => ({ title: thread.title, replyCount: thread.comments }));
}

/**
 * Demo's stand-in for the server's `unanswered` sort. The curated mock corpus
 * has no thread with zero replies, so the strict rule the forum list applies
 * would leave this row permanently empty. Threads nobody has marked an answer
 * on, fewest replies first, carries the same meaning and still shows.
 */
function demoUnansweredThreads(): Thread[] {
  return THREADS.filter(
    (thread) =>
      !thread.acceptedPostId && !thread.replies.some((reply) => reply.accepted),
  )
    .slice()
    .sort((first, second) => first.comments - second.comments);
}
