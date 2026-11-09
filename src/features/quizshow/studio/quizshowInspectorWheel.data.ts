/** The radio ids of the slice count field: Auto, then 2 to 8 (the contract's wheelSlicesMin..wheelSlicesMax, pinned by the data test). */
export const WHEEL_SLICE_COUNT_CHOICES = [
  "auto",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
] as const;

export type WheelSliceCountChoice = (typeof WHEEL_SLICE_COUNT_CHOICES)[number];

/** The stored slice count a radio id stands for; Auto is null. */
export function sliceCountOfChoice(
  choice: WheelSliceCountChoice,
): number | null {
  return choice === "auto" ? null : Number(choice);
}

/** The radio id for a stored slice count; null and any count outside 2 to 8 read as Auto. */
export function choiceOfSliceCount(
  sliceCount: number | null,
): WheelSliceCountChoice {
  const matchingChoice = WHEEL_SLICE_COUNT_CHOICES.find(
    (choice) => choice !== "auto" && Number(choice) === sliceCount,
  );
  return matchingChoice ?? "auto";
}
