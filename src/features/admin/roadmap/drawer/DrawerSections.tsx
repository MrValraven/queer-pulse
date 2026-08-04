import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Button } from "../../../../shared/components/ui";
import type {
  AdminRoadmapItemDTO,
  RoadmapItemUpdateBody,
  RoadmapItemWriteBody,
  RoadmapTeamMemberDTO,
  RoadmapUpdateDepsBody,
} from "../../api/roadmapAdmin.types";
import { CommitmentSection } from "./CommitmentSection";
import { GuideSection } from "./GuideSection";
import { ProgressSection } from "./ProgressSection";
import { BlockedSection } from "./BlockedSection";
import { DepsSection } from "./DepsSection";
import { CapacitySection } from "./CapacitySection";
import { VisibilitySafetySection } from "./VisibilitySafetySection";
import { VotesSection } from "./VotesSection";
import { CommentsSection } from "./CommentsSection";
import { NotesSection } from "./NotesSection";
import styles from "./ItemDrawer.module.css";

/**
 * Every section below the field grid, in prototype order. Split out of
 * `ItemDrawerBody.tsx` purely for file size — this component owns no state
 * or writes of its own, just wiring each section's slice of `currentItem`
 * to the shared `onFieldChange`/`onPublicToggle` handlers and gating the
 * edit-only sections (Deps/Votes/Comments) behind `editItem`.
 */
export function DrawerSections({
  currentItem,
  editItem,
  items,
  team,
  onFieldChange,
  onPublicToggle,
  onAddDep,
  onRemoveDep,
  onNotify,
  onOpenAudit,
}: {
  currentItem: RoadmapItemWriteBody | AdminRoadmapItemDTO;
  editItem: AdminRoadmapItemDTO | null;
  items: AdminRoadmapItemDTO[];
  team: RoadmapTeamMemberDTO[];
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
  onPublicToggle: (next: boolean) => void;
  onAddDep: (body: RoadmapUpdateDepsBody) => void;
  onRemoveDep: (body: RoadmapUpdateDepsBody) => void;
  onNotify: () => void;
  onOpenAudit: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <CommitmentSection
        confidence={currentItem.confidence}
        committed={currentItem.committed}
        slips={editItem?.slips ?? []}
        onFieldChange={onFieldChange}
      />

      {currentItem.guide ? (
        <GuideSection guide={currentItem.guide} onFieldChange={onFieldChange} />
      ) : (
        <ProgressSection progress={currentItem.progress} onFieldChange={onFieldChange} />
      )}

      <BlockedSection
        blockedBy={currentItem.blockedBy}
        blockedWhy={currentItem.blockedWhy}
        onFieldChange={onFieldChange}
      />

      {editItem && (
        <DepsSection
          deps={editItem.deps}
          allItems={items}
          currentItemId={editItem.id}
          onAdd={(id) => onAddDep({ add: id })}
          onRemove={(id) => onRemoveDep({ remove: id })}
        />
      )}

      <CapacitySection
        paidKind={currentItem.paidKind}
        weeklyHours={currentItem.weeklyHours}
        cost={currentItem.cost}
        ownerId={currentItem.ownerId}
        team={team}
        items={items}
        onFieldChange={onFieldChange}
      />

      <VisibilitySafetySection
        isPublic={currentItem.isPublic}
        requested={currentItem.requested}
        safetyStatus={currentItem.safetyStatus}
        onPublicToggle={onPublicToggle}
        onFieldChange={onFieldChange}
      />

      {editItem && (
        <VotesSection
          votes={editItem.votes}
          voteBreakdown={editItem.voteBreakdown}
          notified={editItem.notified}
          spikeFlag={editItem.spikeFlag}
          onNotify={onNotify}
        />
      )}

      {editItem && <CommentsSection comments={editItem.comments} />}

      <NotesSection
        description={currentItem.description}
        publicNote={currentItem.publicNote}
        onFieldChange={onFieldChange}
      />

      <div className={styles.section}>
        <p className={styles.emptyNote}>{t("admin:roadmap.drawer.auditNote")}</p>
        {editItem && (
          <Button variant="ghost" size="md" onClick={onOpenAudit}>
            {t("admin:roadmap.drawer.openAuditCta")}
          </Button>
        )}
      </div>
    </>
  );
}
