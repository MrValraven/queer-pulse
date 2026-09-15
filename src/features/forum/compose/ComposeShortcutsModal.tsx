import { Fragment } from "react";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeShortcutsModal.module.css";

export interface ComposeShortcutsModalProps {
  /** Close the reference. Also what the scrim, the X and Escape do. */
  onClose: () => void;
}

/** One row of the reference: the keycaps, and what they do.
 *  `combos` holds alternatives, each an ordered set of caps, so "bold or
 *  italic" reads as ⌘ B / ⌘ I rather than one crowded run. */
interface ShortcutRow {
  id: string;
  combos: readonly (readonly string[])[];
  labelKey: string;
}

const SHORTCUT_ROWS: readonly ShortcutRow[] = [
  {
    id: "publish",
    combos: [["⌘", "↵"]],
    labelKey: "forum:composePage.shortcuts.publish",
  },
  {
    id: "close",
    combos: [["Esc"]],
    labelKey: "forum:composePage.shortcuts.close",
  },
  {
    id: "format",
    combos: [
      ["⌘", "B"],
      ["⌘", "I"],
    ],
    labelKey: "forum:composePage.shortcuts.format",
  },
  {
    id: "mention",
    combos: [["@"], ["#"]],
    labelKey: "forum:composePage.shortcuts.mention",
  },
  {
    id: "move",
    combos: [["←"], ["→"]],
    labelKey: "forum:composePage.shortcuts.move",
  },
  {
    id: "nextField",
    combos: [["Tab"]],
    labelKey: "forum:composePage.shortcuts.nextField",
  },
  {
    id: "thisList",
    combos: [["?"]],
    labelKey: "forum:composePage.shortcuts.thisList",
  },
];

/**
 * The keyboard reference, opened with `?`. A definition list so a screen
 * reader hears each key paired with what it does, in order.
 */
export function ComposeShortcutsModal({ onClose }: ComposeShortcutsModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("forum:composePage.shortcuts.title")}
      onClose={onClose}
      footer={
        <>
          <span className={styles.footSpacer} />
          <Button variant="ghost" onClick={onClose}>
            {t("forum:composePage.overlay.close")}
          </Button>
        </>
      }
    >
      <dl className={styles.list}>
        {SHORTCUT_ROWS.map((row) => (
          <Fragment key={row.id}>
            <dt className={styles.keys}>
              {row.combos.map((combo, comboIndex) => (
                <Fragment key={combo.join("+")}>
                  {comboIndex > 0 && (
                    <span className={styles.or} aria-hidden>
                      /
                    </span>
                  )}
                  {combo.map((keyCap) => (
                    <kbd key={keyCap}>{keyCap}</kbd>
                  ))}
                </Fragment>
              ))}
            </dt>
            <dd className={styles.label}>{t(row.labelKey)}</dd>
          </Fragment>
        ))}
      </dl>
    </Modal>
  );
}
