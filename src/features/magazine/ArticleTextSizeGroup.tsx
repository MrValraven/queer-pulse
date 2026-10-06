import { FiMinus, FiPlus, FiType } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { articleTextSizes, type TextSize } from "./articleTextSize.data";
import styles from "./ArticleToolbar.module.css";

interface Props {
  textSize: TextSize;
  onTextSize: (size: TextSize) => void;
}

/** The toolbar's A− / A / A+ stepper over the reader's text sizes. */
export function ArticleTextSizeGroup({ textSize, onTextSize }: Props) {
  const { t } = useTranslation();

  const sizeIndex = articleTextSizes.indexOf(textSize);
  const decreaseSize = () =>
    sizeIndex > 0 && onTextSize(articleTextSizes[sizeIndex - 1]!);
  const increaseSize = () =>
    sizeIndex < articleTextSizes.length - 1 &&
    onTextSize(articleTextSizes[sizeIndex + 1]!);

  return (
    <div
      className={styles.group}
      role="group"
      aria-label={t("magazine:toolbar.textSizeGroupAriaLabel")}
    >
      <FiType className={styles.groupIcon} aria-hidden />
      <button
        type="button"
        className={styles.iconBtn}
        onClick={decreaseSize}
        disabled={sizeIndex === 0}
        aria-label={t("magazine:toolbar.decreaseTextSizeAriaLabel")}
      >
        <FiMinus aria-hidden />
      </button>
      <span className={styles.sizeReadout} aria-live="polite">
        {textSize === "sm" ? "A−" : textSize === "lg" ? "A+" : "A"}
      </span>
      <button
        type="button"
        className={styles.iconBtn}
        onClick={increaseSize}
        disabled={sizeIndex === articleTextSizes.length - 1}
        aria-label={t("magazine:toolbar.increaseTextSizeAriaLabel")}
      >
        <FiPlus aria-hidden />
      </button>
    </div>
  );
}
