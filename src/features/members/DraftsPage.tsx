import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDrafts } from "../../app/providers/DraftsProvider";
import { DraftsHeader } from "./DraftsHeader";
import { DraftsControls } from "./DraftsControls";
import { DraftRow } from "./DraftRow";
import { DraftsBulkBar } from "./DraftsBulkBar";
import {
  DRAFTS,
  DRAFT_TABS,
  KEPT_META,
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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const loading = useSimulatedLoad();
  const { drafts: userDrafts, addDraft, removeDraft } = useDrafts();

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
  // with any "kept" draft's 90-day timer visibly reset.
  const base = useMemo(() => {
    return [...userDrafts, ...DRAFTS]
      .filter((d) => !hidden.has(d.id))
      .map((d): Draft =>
        kept.has(d.id)
          ? { ...d, status: "draft", deadlineDays: null, meta: KEPT_META }
          : d,
      );
  }, [userDrafts, hidden, kept]);

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

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

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
      ids.length === 1 ? "Draft deleted" : `${ids.length} drafts deleted`,
      "info",
      undefined,
      {
        label: "Undo",
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
      showToast("Draft kept — 30 more days", "success");
    } else if (draft.href) navigate(draft.href);
    else showToast(action.label, "info");
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

        <div className={styles.tabs} role="tablist" aria-label="Draft types">
          {DRAFT_TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              role="tab"
              aria-selected={category === t.key}
              className={`${styles.tab} ${category === t.key ? styles.active : ""}`}
              onClick={() => setCategory(t.key)}
            >
              {t.label} <span className={styles.tabCount}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        <div className={styles.selectAll}>
          <input
            ref={selectAllRef}
            type="checkbox"
            className={styles.cbx}
            checked={allSelected}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            aria-label="Select all visible drafts"
          />
          <span>Select all</span>
          <span className={styles.visCount}>
            {visible.length} of {base.length} draft
            {base.length === 1 ? "" : "s"}
          </span>
        </div>

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
          <b>About the 90-day rule:</b> drafts you haven't touched in 87+ days
          get an email reminder, then auto-delete on day 90. You can extend any
          draft 30 days at a time.{" "}
          <em>This is to keep your drafts list honest — not to lose work.</em>
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
  let title = "Nothing here yet.";
  let text = "No drafts in this category. Switch tabs, or start something new.";
  if (query.trim()) {
    title = "No matches.";
    text = `Nothing in your drafts matches "${query.trim()}". Try a different word, or clear the search.`;
  } else if (baseEmpty) {
    title = "All caught up.";
    text =
      "No drafts left — nothing half-written waiting on you. When you start something and step away, it'll be saved here.";
  }
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <FiCheck aria-hidden />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <Button variant="primary" to={routes.communitiesHome}>
        Start something new
      </Button>
    </div>
  );
}
