import { useState } from "react";
import { SegmentedControl } from "../../shared/components/ui";
import { useTheme, type Theme } from "../../app/providers/themeContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CardSkin } from "./api/cards.api";
import { MembershipCardFace } from "./MembershipCardFace";
import { previewCard } from "./cardDesigner.data";
import styles from "./CardDesignerModal.module.css";

/**
 * The designer's live preview column: the card as a member will hold it, plus
 * a light/dark switch.
 *
 * The switch matters because `--cream`, `--plum` and `--ink` all flip with the
 * theme, so a card designed at night is not the card a member sees at noon.
 * It only re-themes this subtree (the token overrides in `colors.css` hang off
 * a plain `[data-theme="dark"]` attribute selector, not off `:root`), so it
 * never touches the member's own theme choice.
 */
export function CardDesignerPreview({
  communityName,
  cardName,
  skin,
  accentToken,
  crestUrl,
  backgroundPreset,
  backgroundUrl,
  validityMonths,
  serialPrefix,
  holderName,
  allowsMemberPhoto,
  holderAvatarUrl,
}: {
  communityName: string;
  cardName: string;
  skin: CardSkin;
  accentToken: string;
  crestUrl: string | null;
  backgroundPreset: string | null;
  backgroundUrl: string | null;
  validityMonths: number | null;
  serialPrefix: string | undefined;
  holderName: string;
  allowsMemberPhoto: boolean;
  holderAvatarUrl: string | null;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  // Opens on whatever the owner is already looking at, so the preview matches
  // the surrounding modal until they deliberately check the other side.
  const [previewTheme, setPreviewTheme] = useState<Theme>(theme);

  return (
    <div className={styles.preview}>
      <div className={styles.previewCard} data-theme={previewTheme}>
        {/* Keyed on the photo switch so toggling it remounts the face, which
            turns the preview back to the FRONT — the side the photo lives on.
            Without this an owner who flipped to the back and then switched
            photos on watches nothing happen. Nothing is lost by remounting:
            a preview card mints no token and holds no other state. */}
        <MembershipCardFace
          key={allowsMemberPhoto ? "with-photo" : "no-photo"}
          card={previewCard(communityName, cardName, skin, accentToken, {
            holderName,
            crestUrl,
            backgroundPreset,
            backgroundUrl,
            validityMonths,
            serialPrefix,
            allowsMemberPhoto,
            holderAvatarUrl,
          })}
          isActive={false}
          isPreview
        />
      </div>

      <div className={styles.previewFoot}>
        <p className={styles.previewCaption}>
          {t("cards:designer.previewCaption")}
        </p>
        <SegmentedControl
          label={t("cards:designer.previewThemeLabel")}
          value={previewTheme}
          onChange={(value) => setPreviewTheme(value as Theme)}
          options={[
            { value: "light", label: t("cards:designer.previewLight") },
            { value: "dark", label: t("cards:designer.previewDark") },
          ]}
        />
      </div>
    </div>
  );
}
