import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDrafts } from "../../app/providers/useDrafts";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { DraftsHeader } from "./DraftsHeader";
import { DraftsControls } from "./DraftsControls";
import { DraftRow } from "./DraftRow";
import { DraftsBulkBar } from "./DraftsBulkBar";
import { DraftsTabs } from "./DraftsTabs";
import {
  DRAFTS,
  DRAFT_ACTION_LABEL_KEY,
  buildKeptMeta,
  countByCategory,
  selectDrafts,
  type Draft,
  type DraftAction,
  type DraftCategory,
  type DraftSortKey,
} from "./drafts.data";
import { routes } from "../../app/routeMap";
import styles from "./DraftsPage.module.css";

/** Loading placeholder mirroring a draft row. */
function DraftRowSkeleton() {
  return (
    <div className={styles.row} aria-hidden>
      <SkeletonLine
        width={18}
        height={18}
        style={{ borderRadius: 5, flex: "none", marginTop: 5 }}
      />
      <SkeletonLine
        width={38}
        height={38}
        style={{ borderRadius: 10, flex: "none" }}
      />
      <div className={styles.info}>
        <SkeletonLine width="45%" height={16} />
        <SkeletonLine width="80%" height={13} style={{ marginTop: 8 }} />
        <SkeletonLine
          width={140}
          height={6}
          style={{ marginTop: 14, borderRadius: 3 }}
        />
      </div>
      <SkeletonLine width={70} height={30} style={{ borderRadius: 7 }} />
    </div>
  );
}

export function DraftsPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const simulatedLoad = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  // The prototype's fake fetch delay is DEMO-ONLY. Drafts come from local
  // state, so in live mode there is nothing to wait for: showing 600ms of
  // skeleton there just made the page feel slower than it is.
  const loading = demoMode && simulatedLoad;
  const { drafts: userDrafts, addDraft, removeDraft } = useDrafts();
  const keptMeta = useMemo(() => buildKeptMeta(t, fmt), [t, fmt]);

  const [category, setCategory] = useState<"all" | DraftCategory>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DraftSortKey>("edited");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [kept, setKept] = useState<Set<string>>(new Set());

  const userIds = useMemo(
    () => new Set(userDrafts.map((d) => d.id)),
    [userDrafts],
  );

  // Live list: user drafts ahead of the mock set, minus locally-deleted ones,
  // with any "kept" draft's 90-day timer visibly reset. The static mock drafts
  // are demo-only — live mode shows just the member's real drafts.
  const base = useMemo(() => {
    return [...userDrafts, ...(demoMode ? DRAFTS : [])]
      .filter((d) => !hidden.has(d.id))
      .map((d): Draft =>
        kept.has(d.id)
          ? { ...d, status: "draft", deadlineDays: null, meta: keptMeta }
          : d,
      );
  }, [userDrafts, hidden, kept, demoMode, keptMeta]);

  const counts = useMemo(() => countByCategory(base), [base]);
  const visible = useMemo(
    () => selectDrafts(base, category, query, sort),
    [base, category, query, sort],
  );

  const visibleIds = visible.map((d) => d.id);
  const selectedInList = visibleIds.filter((id) => selected.has(id));
  const allSelected =
    visible.length > 0 && selectedInList.length === visible.length;
  const someSelected = selectedInList.length > 0 && !allSelected;
  // Selection persists across tabs/search — the bulk bar acts on every selected
  // draft that still exists, not just the ones currently visible.
  const selectedIds = base.filter((d) => selected.has(d.id)).map((d) => d.id);

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  function deleteDrafts(ids: string[]) {
    if (!ids.length) return;
    const userDel = ids.filter((id) => userIds.has(id));
    const staticDel = ids.filter((id) => !userIds.has(id));
    const snapshotUser = userDrafts.filter((d) => userDel.includes(d.id));

    userDel.forEach(removeDraft);
    if (staticDel.length) setHidden((p) => new Set([...p, ...staticDel]));
    setSelected((p) => {
      const next = new Set(p);
      ids.forEach((id) => next.delete(id));
      return next;
    });

    showToast(
      t("members:drafts.toast.deleted", { count: ids.length }),
      "info",
      undefined,
      {
        label: t("members:drafts.toast.undo"),
        onClick: () => {
          if (staticDel.length)
            setHidden((p) => {
              const next = new Set(p);
              staticDel.forEach((id) => next.delete(id));
              return next;
            });
          snapshotUser.forEach(addDraft);
        },
      },
    );
  }

  function runAction(draft: Draft, action: DraftAction) {
    if (action.deletes) deleteDrafts([draft.id]);
    else if (action.keeps) {
      setKept((prev) => new Set(prev).add(draft.id));
      showToast(t("members:drafts.toast.kept"), "success");
    } else if (draft.href) void navigate(draft.href);
    else {
      const actionLabelKey = DRAFT_ACTION_LABEL_KEY[action.label];
      showToast(actionLabelKey ? t(actionLabelKey) : action.label, "info");
    }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <DraftsHeader />
        <DraftsControls
          query={query}
          onQuery={setQuery}
          sort={sort}
          onSort={setSort}
        />

        <DraftsTabs
          category={category}
          onCategory={setCategory}
          counts={counts}
          allSelected={allSelected}
          someSelected={someSelected}
          onToggleAll={toggleSelectAll}
          visibleCount={visible.length}
          totalCount={base.length}
        />

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <DraftRowSkeleton key={i} />)
        ) : visible.length === 0 ? (
          <EmptyState query={query} baseEmpty={base.length === 0} />
        ) : (
          visible.map((d, i) => (
            <FadeIn key={d.id} delay={Math.min(i, 8) * 55}>
              <DraftRow
                draft={d}
                selected={selected.has(d.id)}
                removing={false}
                onToggle={toggleSelect}
                onAction={runAction}
              />
            </FadeIn>
          ))
        )}

        <div className={styles.dangerBlock}>
          <Translation
            i18nKey="members:drafts.dangerNote"
            components={{ b: <b />, em: <em /> }}
          />
        </div>
      </div>

      <DraftsBulkBar
        count={selectedIds.length}
        onDelete={() => deleteDrafts(selectedIds)}
        onCancel={() => setSelected(new Set())}
      />
    </AppShell>
  );
}

/** Contextual empty state: no matches, nothing in this tab, or nothing at all. */
function EmptyState({
  query,
  baseEmpty,
}: {
  query: string;
  baseEmpty: boolean;
}) {
  const { t } = useTranslation();
  let title = t("members:drafts.empty.defaultTitle");
  let text = t("members:drafts.empty.defaultText");
  if (query.trim()) {
    title = t("members:drafts.empty.noMatchTitle");
    text = t("members:drafts.empty.noMatchText", { query: query.trim() });
  } else if (baseEmpty) {
    title = t("members:drafts.empty.allCaughtUpTitle");
    text = t("members:drafts.empty.allCaughtUpText");
  }
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <FiCheck aria-hidden />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <Button variant="primary" to={routes.communities}>
        {t("members:drafts.empty.startCta")}
      </Button>
    </div>
  );
}
