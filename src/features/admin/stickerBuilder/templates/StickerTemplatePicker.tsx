import { useId, useRef, type KeyboardEvent } from "react";
import { FiLock } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STICKER_TEMPLATES } from "../../../stickers/templates/registry";
import type {
  StickerTemplate,
  StickerTemplateId,
} from "../../../stickers/templates/templateDefinition";
import { StickerCanvas } from "../StickerCanvas";
import { BUILDER_TEMPLATES } from "./builderTemplates";
import styles from "./StickerTemplatePicker.module.css";

/** The index an arrow, Home or End key moves to from `index`, wrapping at
 *  both ends as the APG radio group does, or null for any other key. */
function nextIndexFor(key: string, index: number, count: number) {
  if (key === "ArrowRight" || key === "ArrowDown") return (index + 1) % count;
  if (key === "ArrowLeft" || key === "ArrowUp")
    return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

/**
 * Which template the pack's new stickers are drawn from. An open pack shows
 * every template as a compact radio card in one row (a mini sticker and the
 * name, with the description read out as the radio's accessible
 * description). A locked pack shows one quiet line: its template's mini
 * sticker, a lock and a note saying the pack keeps that template.
 *
 * The APG radio group pattern: only the checked card is in the tab order,
 * and the arrow keys (plus Home and End) move focus and the choice together.
 */
export function StickerTemplatePicker({
  template,
  isLocked,
  onChoose,
}: {
  template: StickerTemplate;
  isLocked: boolean;
  onChoose: (templateId: StickerTemplateId) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const heading = (
    <h3 id={headingId} className={styles.heading}>
      {t("admin:stickerPacks.templates.label")}
    </h3>
  );

  if (isLocked) {
    const templateName = t(BUILDER_TEMPLATES[template.id].nameKey);
    return (
      <section className={styles.picker} aria-labelledby={headingId}>
        {heading}
        <p className={styles.lockedLine}>
          <MiniSticker
            template={template}
            name={templateName}
            className={styles.lockedPreview}
          />
          <FiLock className={styles.lockIcon} aria-hidden />
          <span className={styles.lockedText}>
            {t("admin:stickerPacks.templates.lockedNote", {
              template: templateName,
            })}
          </span>
        </p>
      </section>
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number) {
    const nextIndex =
      event.key === " "
        ? index
        : nextIndexFor(event.key, index, STICKER_TEMPLATES.length);
    const nextTemplate =
      nextIndex === null ? undefined : STICKER_TEMPLATES[nextIndex];
    if (nextIndex === null || nextTemplate === undefined) return;
    event.preventDefault();
    onChoose(nextTemplate.id);
    cardRefs.current[nextIndex]?.focus();
  }

  return (
    <section className={styles.picker} aria-labelledby={headingId}>
      {heading}
      <div
        className={styles.cards}
        role="radiogroup"
        aria-labelledby={headingId}
      >
        {STICKER_TEMPLATES.map((candidate, index) => {
          const isChecked = candidate.id === template.id;
          const idPrefix = `${headingId}-${candidate.id}`;
          const builderTemplate = BUILDER_TEMPLATES[candidate.id];
          const name = t(builderTemplate.nameKey);
          return (
            <div
              key={candidate.id}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              role="radio"
              aria-checked={isChecked}
              aria-labelledby={`${idPrefix}-name`}
              aria-describedby={`${idPrefix}-description`}
              tabIndex={isChecked ? 0 : -1}
              className={[styles.card, isChecked && styles.cardChecked]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChoose(candidate.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <MiniSticker
                template={candidate}
                name={name}
                className={styles.cardPreview}
              />
              <span id={`${idPrefix}-name`} className={styles.name}>
                {name}
              </span>
              <span id={`${idPrefix}-description`} className="visuallyHidden">
                {t(builderTemplate.descriptionKey, {
                  count: candidate.items.length,
                })}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** The template's cover sticker at its default style. It is decoration (the
 *  name beside it says which template it is), so it stays out of the
 *  accessibility tree; the wrapper's class sets its size. */
function MiniSticker({
  template,
  name,
  className,
}: {
  template: StickerTemplate;
  name: string;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden>
      <StickerCanvas
        template={template}
        style={template.defaultStyle}
        itemId={template.coverItemId}
        className={styles.canvas}
        label={name}
      />
    </span>
  );
}
