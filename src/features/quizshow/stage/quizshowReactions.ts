import type { IconType } from "react-icons";
import { FaFire, FaRegFaceLaughBeam, FaRegFaceSurprise } from "react-icons/fa6";
import { FiHeart } from "react-icons/fi";
import { PiConfettiBold, PiHandsClappingBold } from "react-icons/pi";
import type { QuizshowReactionId } from "../../../shared/contracts/quizshow";

/**
 * The reaction icons (C2.1, verbatim). `FiHeart` is a Feather outline: every
 * consumer renders it with `fill="none"` in every branch (an undefined fill
 * paints a Feather icon black).
 * Read the fill through `reactionIconFill` so the rule lives in one place.
 */
export const QUIZSHOW_REACTION_ICONS: Record<QuizshowReactionId, IconType> = {
  heart: FiHeart,
  fire: FaFire,
  clap: PiHandsClappingBold,
  laugh: FaRegFaceLaughBeam,
  wow: FaRegFaceSurprise,
  party: PiConfettiBold,
};

/** Accessible names of the reactions: `quizshow:reactions.<id>`. */
export const QUIZSHOW_REACTION_LABEL_KEYS: Record<QuizshowReactionId, string> =
  {
    heart: "quizshow:reactions.heart",
    fire: "quizshow:reactions.fire",
    clap: "quizshow:reactions.clap",
    laugh: "quizshow:reactions.laugh",
    wow: "quizshow:reactions.wow",
    party: "quizshow:reactions.party",
  };

/** The `fill` prop for a reaction icon: "none" for the Feather heart, "currentColor" for the filled sets. */
export function reactionIconFill(reactionId: QuizshowReactionId): string {
  return reactionId === "heart" ? "none" : "currentColor";
}
