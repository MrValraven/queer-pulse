import { useState } from "react";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { SegmentedControl } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta } from "../../shared/seo";
import type { ArticleLifecycleRecordDTO } from "./api/lifecycle.api";
import {
  useLifecycleDesk,
  useLifecycleMutations,
} from "./api/useLifecycleDesk";
import {
  LifecycleCountsBar,
  LifecycleList,
} from "./desk/lifecycle/LifecycleBoard";
import { LifecycleEditModal } from "./desk/lifecycle/LifecycleEditModal";
import { LifecycleTranslationsModal } from "./desk/lifecycle/LifecycleTranslationsModal";
import styles from "./LifecycleDeskPage.module.css";

/** How far ahead the review queue looks. A month is one editorial cycle; the
 *  wider windows are for planning rather than for today's work. */
const HORIZONS = [30, 90, 365];

/**
 * CON-16 — the lifecycle desk, behind `/magazine/editor/lifecycle`.
 *
 * The archive's own surface. Everywhere else in the desk runs a piece TOWARDS
 * publication; this is the one place that asks what the published archive is
 * still telling readers, and whether the desk has kept the promises it made
 * about re-checking it.
 *
 * Two lists, deliberately: the review queue is work owed, and the flagged list
 * is what a reader currently sees a banner on. Collapsing them would hide the
 * case worth noticing, which is a piece in both.
 */
export function LifecycleDeskPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [horizonDays, setHorizonDays] = useState(HORIZONS[0]!);
  const [editing, setEditing] = useState<ArticleLifecycleRecordDTO | null>(
    null,
  );
  const [translating, setTranslating] =
    useState<ArticleLifecycleRecordDTO | null>(null);

  const { data, isLoading } = useLifecycleDesk(horizonDays);
  const { setLifecycle, openTranslation } = useLifecycleMutations();

  // Demo mode has no write path: the fixture is static, and a control that
  // reported success while changing nothing is exactly the fake-success
  // pattern the audit flags. The board still reads, so the shape is visible.
  const canEdit = !demoMode;

  return (
    <MagazineDeskShell>
      <PageMeta title={t("magazine:lifecycle.pageTitle")} />
      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t("magazine:lifecycle.heading")}</h1>
            <p className={styles.blurb}>{t("magazine:lifecycle.blurb")}</p>
          </div>
          <SegmentedControl
            value={String(horizonDays)}
            onChange={(value) => setHorizonDays(Number(value))}
            options={HORIZONS.map((days) => ({
              value: String(days),
              label: t("magazine:lifecycle.horizon", { days }),
            }))}
            label={t("magazine:lifecycle.horizonAria")}
          />
        </header>

        <LifecycleCountsBar counts={data?.counts} />

        <LifecycleList
          headingKey="magazine:lifecycle.queue.heading"
          blurbKey="magazine:lifecycle.queue.blurb"
          emptyKey="magazine:lifecycle.queue.empty"
          records={data?.dueForReview ?? []}
          isLoading={isLoading}
          onEdit={canEdit ? setEditing : undefined}
          onLanguages={canEdit ? setTranslating : undefined}
        />

        <LifecycleList
          headingKey="magazine:lifecycle.flagged.heading"
          blurbKey="magazine:lifecycle.flagged.blurb"
          emptyKey="magazine:lifecycle.flagged.empty"
          records={data?.flagged ?? []}
          isLoading={isLoading}
          onEdit={canEdit ? setEditing : undefined}
          onLanguages={canEdit ? setTranslating : undefined}
        />
      </div>

      {editing && (
        <LifecycleEditModal
          record={editing}
          isSaving={setLifecycle.isPending}
          onClose={() => setEditing(null)}
          onSave={(dto) => {
            const pieceId = editing.pieceId;
            if (!pieceId) return;
            setLifecycle.mutate(
              { pieceId, dto },
              {
                onSuccess: () => {
                  showToast(t("magazine:lifecycle.saved"));
                  setEditing(null);
                },
                onError: () =>
                  showToast(t("magazine:lifecycle.saveFailed"), "error"),
              },
            );
          }}
        />
      )}

      {translating && (
        <LifecycleTranslationsModal
          record={translating}
          isSaving={openTranslation.isPending}
          onClose={() => setTranslating(null)}
          onOpenTranslation={(dto) => {
            const pieceId = translating.pieceId;
            if (!pieceId) return;
            openTranslation.mutate(
              { pieceId, dto },
              {
                onSuccess: (created) => {
                  showToast(
                    t("magazine:lifecycle.languages.opened", {
                      slug: created.slug,
                    }),
                  );
                  setTranslating(null);
                },
                onError: () =>
                  showToast(
                    t("magazine:lifecycle.languages.openFailed"),
                    "error",
                  ),
              },
            );
          }}
        />
      )}
    </MagazineDeskShell>
  );
}
