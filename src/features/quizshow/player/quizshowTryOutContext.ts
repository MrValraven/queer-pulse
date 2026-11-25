import { createContext } from "react";

/**
 * True inside the studio's try-out phone (item 55). The phone screens then
 * keep the player in the try-out: "Leave the game" and the end screen's links
 * out of the game stay hidden, and a phase change only moves focus when focus
 * is already on the phone. False everywhere else, so the play page behaves as
 * it always has.
 */
export const QuizshowTryOutContext = createContext(false);
