import { useMemo, useState } from "react";
import { Avatar } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import type { SubprofileKind } from "./api/subprofiles.api";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileShowcase.module.css";

/**
 * The list beside the featured hero. Each row is a toggle that previews its
 * persona into the hero (it does not navigate — the hero is the one opener), so
 * this reads as a Slack/Figma-style identity switcher, not a wall of links.
 *
 * When `asIndex` is set (the owner has many personas), the list gains a craft
 * filter and collapses to `collapsedRows` with a "show all" toggle — the
 * research-backed way to scale past ~6 without resorting to tabs or a carousel.
 */
export function SubprofileSwitchList({
  personas,
  activeSlug,
  onSelect,
  asIndex,
  collapsedRows,
}: {
  personas: PublicSubprofileView[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  asIndex: boolean;
  collapsedRows: number;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<SubprofileKind | "all">("all");
  const [expanded, setExpanded] = useState(false);

  // Kinds present, in first-appearance order — the filter chips.
  const kinds = useMemo(() => {
    const seen: SubprofileKind[] = [];
    for (const persona of personas) {
      if (!seen.includes(persona.kind)) seen.push(persona.kind);
    }
    return seen;
  }, [personas]);

  const filtered =
    asIndex && filter !== "all"
      ? personas.filter((persona) => persona.kind === filter)
      : personas;

  // Only the unfiltered "all" view collapses; a craft filter shows all matches.
  const isCollapsed = asIndex && !expanded && filter === "all";
  const visible = isCollapsed ? filtered.slice(0, collapsedRows) : filtered;
  const hiddenCount = filtered.length - visible.length;
  const showToggle =
    asIndex && filter === "all" && personas.length > collapsedRows;

  return (
    <div className={styles.switcher}>
      <p className={styles.switchHead}>{t("subprofiles:alsoAs.switchLabel")}</p>

      {asIndex && kinds.length > 1 && (
        <div
          className={styles.filters}
          role="group"
          aria-label={t("subprofiles:alsoAs.filterLabel")}
        >
          <button
            type="button"
            className={styles.chip}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {t("subprofiles:alsoAs.filterAll")}
          </button>
          {kinds.map((kind) => (
            <button
              key={kind}
              type="button"
              className={styles.chip}
              aria-pressed={filter === kind}
              onClick={() => {
                setFilter(kind);
                setExpanded(true);
              }}
            >
              {t(KIND_LABEL_KEYS[kind])}
            </button>
          ))}
        </div>
      )}

      <div
        className={styles.switchList}
        role="group"
        aria-label={t("subprofiles:alsoAs.previewLabel")}
      >
        {visible.map((persona) => {
          const accent = persona.accent ?? DEFAULT_ACCENT;
          const { tint, on } = ACCENT_TOKENS[accent];
          const isSelected = persona.slug === activeSlug;
          return (
            <button
              key={persona.slug}
              type="button"
              className={styles.row}
              aria-pressed={isSelected}
              style={{
                ["--accent-tint" as string]: tint,
                ["--accent-on" as string]: on,
              }}
              onClick={() => onSelect(persona.slug)}
            >
              <Avatar
                initials={initialsFromName(persona.displayName, "?")}
                src={persona.avatarUrl ?? undefined}
                tint="plum"
                size={38}
                className={styles.rowAvatar}
              />
              <span className={styles.rowMain}>
                <span className={styles.rowName}>{persona.displayName}</span>
                <span className={styles.rowKind}>
                  {t(KIND_LABEL_KEYS[persona.kind])}
                </span>
              </span>
              {isSelected && <span className={styles.rowActive} aria-hidden />}
            </button>
          );
        })}
      </div>

      {showToggle && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded
            ? t("subprofiles:alsoAs.showFewer")
            : t("subprofiles:alsoAs.showAll", { count: hiddenCount })}
        </button>
      )}
    </div>
  );
}
