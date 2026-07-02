import { StudioShell } from "./StudioShell";
import { StudioSheetPreview } from "./StudioSheetPreview";
import { StudioSheetCheckout } from "./StudioSheetCheckout";
import { StudioSheetAlso } from "./StudioSheetAlso";
import s from "./sheet.module.css";

export function StudioSheetStorePage() {
  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>Sheet music &amp; lyrics archive</div>
        <h1>
          Buy the <em>score</em>, pay the people.
        </h1>
        <div className={s.dek}>
          A €1 micropayment unlocks a clean, printable PDF — and splits{" "}
          <em>90/10</em> to the people who made and transcribed it. Reading is
          free; downloading pays.
        </div>
      </div>

      <div className={s.grid}>
        <StudioSheetPreview />
        <StudioSheetCheckout />
      </div>

      <StudioSheetAlso />
    </StudioShell>
  );
}
