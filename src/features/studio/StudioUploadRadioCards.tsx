import type { ReactNode } from "react";
import { RadioCardGroup } from "../../shared/components/ui";
import s from "./creator.module.css";

export interface UploadRadioCardOption<OptionId extends string> {
  id: OptionId;
  label: ReactNode;
  /** A quiet second line, such as a persona's kind. */
  meta?: ReactNode;
  /** The card shows but cannot be picked (aria-disabled on the shared group). */
  isDisabled?: boolean;
}

/** The release step's single choices (persona, type) as Studio radio
 *  cards on the shared radiogroup: a 44px card with its own dot, arrow
 *  keys moving between them, the legend naming the group. */
export function StudioUploadRadioCards<OptionId extends string>({
  options,
  value,
  onChange,
  legendId,
  describedBy,
}: {
  options: UploadRadioCardOption<OptionId>[];
  value: OptionId | "";
  onChange: (id: OptionId) => void;
  /** The fieldset legend's id, which names the radiogroup. */
  legendId: string;
  describedBy?: string;
}) {
  return (
    <RadioCardGroup
      value={value}
      onChange={onChange}
      ariaLabel=""
      ariaLabelledBy={legendId}
      ariaDescribedBy={describedBy}
      className={s.radioCards}
      optionClassName={s.radioCard}
      checkedClassName={s.radioCardOn}
      options={options.map((option) => ({
        id: option.id,
        isDisabled: option.isDisabled,
        render: (
          <>
            <span className={s.radioDot} aria-hidden />
            <span className={s.radioCardText}>
              {option.label}
              {option.meta && (
                <span className={s.radioCardMeta}>{option.meta}</span>
              )}
            </span>
          </>
        ),
      }))}
    />
  );
}
