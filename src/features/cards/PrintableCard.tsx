import type { CardSkin, MyCardDTO } from "./api/cards.api";
import { CardBackFace } from "./CardBackFace";
import { CardFrontFace } from "./CardFrontFace";
import { backgroundPresetValue } from "./cardBackgrounds.data";
import faceStyles from "./MembershipCardFace.module.css";
import styles from "./CardPrintSheet.module.css";

// Same map `MembershipCardFace` keeps, and for the same reason: it depends on
// the CSS module import, so it stays in a component file rather than a
// colocated .data.ts.
const SKIN_CLASS: Record<CardSkin, string | undefined> = {
  plum: faceStyles.skinPlum,
  cream: faceStyles.skinCream,
  jade: faceStyles.skinJade,
  coral: faceStyles.skinCoral,
  ink: faceStyles.skinInk,
};

/**
 * One card as a fold-over blank: front and back side by side, sharing the
 * vertical centre line they fold along.
 *
 * Folding on a VERTICAL line flips horizontally, so the back reads correctly
 * with no rotation. That is the whole reason for this layout: it sidesteps
 * duplex printing, whose one to three millimetres of registration drift on an
 * office printer is enough to ruin a cut card.
 *
 * Deliberately not `MembershipCardFace`. That component owns a flipper, a
 * gloss that tracks the pointer, and a button to turn the card over, none of
 * which mean anything on paper. It reuses the same two faces and the same
 * skin classes, so a printed card is the card the member holds rather than a
 * second drawing of it that can drift.
 */
export function PrintableCard({ card }: { card: MyCardDTO }) {
  const ground = card.program.backgroundUrl
    ? `url(${JSON.stringify(card.program.backgroundUrl)}) center / cover no-repeat`
    : backgroundPresetValue(card.program.backgroundPreset);
  const skinClass = SKIN_CLASS[card.program.skin];

  const shellStyle = {
    ["--card-accent" as string]: `var(--${card.program.accentToken})`,
    ...(ground ? { ["--card-ground" as string]: ground } : {}),
  };

  return (
    <div className={styles.blank}>
      <div className={`${faceStyles.shell} ${styles.side}`} style={shellStyle}>
        <article
          className={[
            faceStyles.face,
            faceStyles.faceFront,
            skinClass,
            ground && faceStyles.hasGround,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CardFrontFace card={card} isPreview={false} />
        </article>
      </div>

      <div className={`${faceStyles.shell} ${styles.side}`} style={shellStyle}>
        <article
          className={[faceStyles.face, faceStyles.faceBack, skinClass]
            .filter(Boolean)
            .join(" ")}
        >
          <CardBackFace card={card} isPreview={false} />
        </article>
      </div>
    </div>
  );
}
