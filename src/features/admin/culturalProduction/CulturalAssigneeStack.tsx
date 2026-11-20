import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiUser } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { intlLocale, isLanguage } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminAvatar, type AvatarTone } from "../ui";
import type { CulturalStaffSummaryDTO } from "./api/culturalProduction.types";
import { useCulturalViewerId } from "./useCulturalViewerId";
import styles from "./CulturalParts.module.css";

const MOTION_SECONDS = 0.2;
const MOTION_EASE = [0.22, 0.68, 0.16, 1] as const;

/** The initials tones a staff avatar picks from, by user id. */
const STAFF_AVATAR_TONES: readonly AvatarTone[] = [
  "plum",
  "coral",
  "jade",
  "violet",
  "amber",
];

/** Up to two capitals: the first and last word's first letters. A blank
 *  name gives "", so the avatar draws a person icon. */
function initialsOf(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  const firstLetterOf = (word: string): string => Array.from(word)[0] ?? "";
  const firstWord = words[0] ?? "";
  const lastWord = words.length > 1 ? (words.at(-1) ?? "") : "";
  return (firstLetterOf(firstWord) + firstLetterOf(lastWord)).toUpperCase();
}

/** One steady initials tone per person, picked from the user id. */
function toneOf(userId: string): AvatarTone {
  let codePointSum = 0;
  for (const character of userId) codePointSum += character.codePointAt(0) ?? 0;
  return STAFF_AVATAR_TONES[codePointSum % STAFF_AVATAR_TONES.length] ?? "plum";
}

/** A short inline piece that fades as it comes and goes. */
function FadeInline({
  isShown,
  className,
  children,
}: {
  isShown: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : MOTION_SECONDS,
    ease: MOTION_EASE,
  };
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key="shown"
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition }}
          exit={{ opacity: 0, transition }}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}

/**
 * The staff on a task row, or the backers on an idea card: up to `maxShown`
 * overlapping avatars (a photo, else initials on a steady tone, else a
 * person icon), then "+N" for the rest. The eye reads the stack; assistive
 * tech reads "Assigned to you and Nuno Alves", every name joined by
 * `Intl.ListFormat`. Nobody reads "Unassigned". Avatars fade and scale as
 * people come and go.
 */
export function CulturalAssigneeStack({
  people,
  maxShown = 3,
  size = "sm",
}: {
  people: CulturalStaffSummaryDTO[];
  maxShown?: number;
  size?: "sm" | "md";
}) {
  const { t, language } = useTranslation();
  const viewerId = useCulturalViewerId();
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : MOTION_SECONDS,
    ease: MOTION_EASE,
  };
  const hiddenScale = reducedMotion ? 1 : 0.8;
  const shownPeople = people.slice(0, Math.max(0, maxShown));
  const moreCount = people.length - shownPeople.length;
  const isEmpty = people.length === 0;

  const names = people.map((person) => {
    if (viewerId !== null && person.id === viewerId) {
      return t("admin:culturalProduction.staff.youInSentence");
    }
    const name = person.displayName.trim();
    return name === ""
      ? t("admin:culturalProduction.common.formerTeamMember")
      : name;
  });
  const locale = intlLocale(isLanguage(language) ? language : "en");
  const spokenLine = isEmpty
    ? null
    : t("admin:culturalProduction.tasks.row.assigneesAria", {
        names: new Intl.ListFormat(locale, {
          style: "long",
          type: "conjunction",
        }).format(names),
      });

  return (
    <span className={styles.stack}>
      <span
        className={[styles.avatars, size === "md" ? styles.avatarsMd : null]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        <AnimatePresence initial={false}>
          {shownPeople.map((person) => {
            const initials = initialsOf(person.displayName);
            return (
              <m.span
                key={person.id}
                className={styles.avatarSlot}
                initial={{ opacity: 0, scale: hiddenScale }}
                animate={{ opacity: 1, scale: 1, transition }}
                exit={{ opacity: 0, scale: hiddenScale, transition }}
              >
                <AdminAvatar
                  size={size}
                  src={person.avatarUrl ?? undefined}
                  alt=""
                  initials={initials === "" ? <FiUser /> : initials}
                  tone={toneOf(person.id)}
                />
              </m.span>
            );
          })}
        </AnimatePresence>
        <FadeInline isShown={moreCount > 0} className={styles.more}>
          {t("admin:culturalProduction.tasks.row.assigneesMore", {
            count: moreCount,
          })}
        </FadeInline>
      </span>
      <FadeInline isShown={isEmpty} className={styles.unassigned}>
        {t("admin:culturalProduction.tasks.row.unassigned")}
      </FadeInline>
      {spokenLine !== null ? (
        <span className="visuallyHidden">{spokenLine}</span>
      ) : null}
    </span>
  );
}
