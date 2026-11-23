import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileSafetyMenu.module.css";

/** The safety menu's "Hide my profile from {name}" item, which reads "Show my
 *  profile to {name}" once the profile is hidden from them; the requests and
 *  their toasts live in `useHideProfileFrom`. */
export function HideProfileFromMenuItem({
  firstName,
  isHidden,
  isBusy,
  onHide,
  onShow,
}: {
  firstName: string;
  isHidden: boolean;
  isBusy: boolean;
  /** Closes the menu and sends the hide. */
  onHide: () => void;
  /** Closes the menu and shows the profile to this member again. */
  onShow: () => void;
}) {
  const { t } = useTranslation();
  const onClick = isHidden ? onShow : onHide;
  // `aria-disabled` keeps the item focusable, so arrow-key navigation still
  // passes through it while a request is in flight; the click is ignored then.
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={styles.item}
      onClick={isBusy ? undefined : onClick}
      aria-disabled={isBusy}
    >
      {isHidden ? <FiEye aria-hidden /> : <FiEyeOff aria-hidden />}
      {t(
        isHidden ? "safety:profileMenu.showTo" : "safety:profileMenu.hideFrom",
        { name: firstName },
      )}
    </button>
  );
}
