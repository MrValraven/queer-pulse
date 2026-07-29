import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { memberAvatar } from "./data/members";
import { TYPE_ICON, TYPE_LABEL_KEY, type SearchItem } from "./search.data";
import styles from "./CommandPalette.module.css";

/** The recents chips + the keyboard-navigable results list for the palette. */
export function CommandPaletteResults({
  q,
  recents,
  setQuery,
  results,
  activeIndex,
  setActive,
  goToItem,
}: {
  q: string;
  recents: string[];
  setQuery: (value: string) => void;
  results: SearchItem[];
  activeIndex: number;
  setActive: (index: number) => void;
  goToItem: (item: SearchItem) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      {!q && (
        <div className={styles.recents}>
          {recents.slice(0, 5).map((r) => (
            <button
              key={r}
              type="button"
              className={styles.recentChip}
              onClick={() => setQuery(r)}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <ul className={styles.results} id="qp-cmd-results" role="listbox">
        {results.length === 0 && (
          <li className={styles.noResults}>
            {t("members:commandPalette.noMatches")}
          </li>
        )}
        {results.map((item, i) => {
          const Icon = TYPE_ICON[item.t];
          const avatar = item.slug ? memberAvatar(item.slug) : undefined;
          return (
            <li
              key={`${item.t}-${item.name}`}
              id={`qp-cmd-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <button
                type="button"
                className={[styles.row, i === activeIndex && styles.rowActive]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActive(i)}
                onClick={() => goToItem(item)}
              >
                {avatar ? (
                  <Avatar
                    initials={avatar.initials}
                    tint={avatar.tint}
                    src={avatar.photo}
                    alt={item.name}
                    size={34}
                  />
                ) : (
                  <span className={styles.rowIcon} aria-hidden>
                    <Icon />
                  </span>
                )}
                <span className={styles.rowBody}>
                  <span className={styles.nameRow}>
                    <span className={styles.rowName}>{item.name}</span>
                    <MemberStaffBadge slug={item.slug} />
                  </span>
                  <span className={styles.rowSub}>{item.sub}</span>
                </span>
                <span className={styles.rowType}>
                  {t(TYPE_LABEL_KEY[item.t])}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
