import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SocialLink } from "./data/members";
import { SocialLinksEditorRow } from "./SocialLinksEditorRow";
import { useRowKeys } from "./useRowKeys";
import styles from "./ProfileEdit.module.css";

/**
 * Edit-mode "Links" control: add / remove rows, each a platform select plus a
 * handle/URL field. Bound to the draft in `ProfileProvider` via `onChange`.
 * Empty rows are kept while editing (so a just-added row isn't yanked away) and
 * filtered out on save by the provider.
 */
export function SocialLinksEditor({
  links,
  onChange,
}: {
  links: SocialLink[];
  onChange: (next: SocialLink[]) => void;
}) {
  const { t } = useTranslation();
  const { keys, appendKey, removeKeyAt } = useRowKeys(links.length);
  function update(index: number, patch: Partial<SocialLink>) {
    onChange(
      links.map((link, rowIndex) =>
        rowIndex === index ? { ...link, ...patch } : link,
      ),
    );
  }
  function remove(index: number) {
    removeKeyAt(index);
    onChange(links.filter((_, rowIndex) => rowIndex !== index));
  }
  function add() {
    appendKey();
    onChange([...links, { platform: "website", urlOrHandle: "" }]);
  }

  return (
    <div className={styles.linksEditor}>
      {/* A row added later grows in and a removed one folds away, so the rows
          below and the add button glide into place. The rows present when
          editing opens appear as they are. */}
      <AnimatePresence initial={false}>
        {links.map((link, index) => {
          // `keys` moves in lockstep with `links`, so the fallback never shows.
          const rowKey = keys[index] ?? `link-${index}`;
          return (
            <SocialLinksEditorRow
              key={rowKey}
              rowKey={rowKey}
              link={link}
              onUpdate={(patch) => update(index, patch)}
              onRemove={() => remove(index)}
            />
          );
        })}
      </AnimatePresence>
      <button type="button" className={styles.addRowBtn} onClick={add}>
        <FiPlus size={15} aria-hidden /> {t("members:social.addLink")}
      </button>
    </div>
  );
}
