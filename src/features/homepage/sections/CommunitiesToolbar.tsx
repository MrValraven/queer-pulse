import { FiSearch } from "react-icons/fi";
import { Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityCategory } from "./Communities.data";
import {
  LANG_LABEL,
  type CommunityFilterState,
  type SortKey,
} from "./useCommunityFilters";
import styles from "./Communities.module.css";

const CATS: Array<{
  key: CommunityCategory | "all";
  labelKey: string;
  dot?: string;
}> = [
  { key: "all", labelKey: "homepage:communities.category.all" },
  {
    key: "social",
    labelKey: "homepage:communities.category.social",
    dot: styles.dotSocial,
  },
  {
    key: "arts",
    labelKey: "homepage:communities.category.arts",
    dot: styles.dotArts,
  },
  {
    key: "support",
    labelKey: "homepage:communities.category.support",
    dot: styles.dotSupport,
  },
  {
    key: "activism",
    labelKey: "homepage:communities.category.activism",
    dot: styles.dotActivism,
  },
];

interface ToolbarProps {
  state: CommunityFilterState;
  patch: (next: Partial<CommunityFilterState>) => void;
  langOptions: string[];
  hoodOptions: string[];
}

export function CommunitiesToolbar({
  state,
  patch,
  langOptions,
  hoodOptions,
}: ToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.tools}>
      <div className={styles.toolSearch}>
        <FiSearch aria-hidden />
        <input
          type="search"
          value={state.q}
          onChange={(e) => patch({ q: e.target.value })}
          placeholder={t("homepage:communities.toolbar.searchPlaceholder")}
          aria-label={t("homepage:communities.toolbar.searchAriaLabel")}
        />
      </div>

      <div className={styles.toolChips}>
        {CATS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={[styles.fchip, state.cat === c.key && styles.fchipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={state.cat === c.key}
            onClick={() => patch({ cat: c.key })}
          >
            {c.dot && <span className={[styles.fdot, c.dot].join(" ")} />}
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      <Select
        size="sm"
        label={t("homepage:communities.toolbar.langAriaLabel")}
        value={state.lang}
        onChange={(value) => patch({ lang: value ?? "all" })}
        options={[
          {
            value: "all",
            label: t("homepage:communities.toolbar.langAllOption"),
          },
          ...langOptions.map((l) => ({ value: l, label: LANG_LABEL[l] ?? l })),
        ]}
      />

      <Select
        size="sm"
        label={t("homepage:communities.toolbar.hoodAriaLabel")}
        value={state.hood}
        onChange={(value) => patch({ hood: value ?? "all" })}
        options={[
          {
            value: "all",
            label: t("homepage:communities.toolbar.hoodAllOption"),
          },
          ...hoodOptions.map((h) => ({ value: h, label: h })),
        ]}
      />

      <button
        type="button"
        className={[styles.toolToggle, state.open && styles.toolToggleOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={state.open}
        onClick={() => patch({ open: !state.open })}
      >
        <span className={styles.tg} aria-hidden />
        {t("homepage:communities.access.open")}
      </button>

      <span className={styles.toolSpacer} />

      <span className={styles.toolSort}>
        {t("homepage:communities.toolbar.sortLabel")}
        <Select
          size="sm"
          label={t("homepage:communities.toolbar.sortAriaLabel")}
          value={state.sort}
          onChange={(value) => patch({ sort: (value ?? "active") as SortKey })}
          options={[
            {
              value: "active",
              label: t("homepage:communities.toolbar.sort.active"),
            },
            {
              value: "size",
              label: t("homepage:communities.toolbar.sort.size"),
            },
            { value: "new", label: t("homepage:communities.toolbar.sort.new") },
            {
              value: "near",
              label: t("homepage:communities.toolbar.sort.near"),
            },
          ]}
        />
      </span>
    </div>
  );
}
