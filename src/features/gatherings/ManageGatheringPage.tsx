import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ManageGatheringTabs,
  ManageGatheringSidebar,
} from "./ManageGatheringTabs";
import { EditDetailsModal } from "./EditDetailsModal";
import { MessageAttendeesModal } from "./MessageAttendeesModal";
import {
  GATHERING_TITLE,
  GATHERING_DESCRIPTION,
  GATHERING_DETAILS,
  ATTENDEE_COUNT,
} from "./manageGathering.data";
import { gatheringCancelledPath, gatheringDashboardPath } from "./data";
import { useUpdateEvent, useCancelEvent } from "./api/useEventMutations";
import styles from "./ManageGatheringPage.module.css";

/** Slug this static manage page is fixed to (Pride Brunch — June). */
const MANAGE_SLUG = "pride-brunch-jun";

interface GatheringState {
  title: string;
  date: string;
  location: string;
  description: string;
  details: { id: string; labelKey: string; value: string }[];
}

function renderTitle(title: string) {
  const idx = title.indexOf("—");
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx).trim()} — <em>{title.slice(idx + 1).trim()}</em>
    </>
  );
}

export function ManageGatheringPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const updateEvent = useUpdateEvent(MANAGE_SLUG);
  const cancelEvent = useCancelEvent(MANAGE_SLUG);
  const [editOpen, setEditOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const dateDetail =
    GATHERING_DETAILS.find((detail) => detail.id === "date")?.value ?? "";
  const venueDetail =
    GATHERING_DETAILS.find((detail) => detail.id === "venue")?.value ?? "";

  const [gathering, setGathering] = useState<GatheringState>({
    title: GATHERING_TITLE,
    date: dateDetail,
    location: venueDetail,
    description: GATHERING_DESCRIPTION,
    details: GATHERING_DETAILS,
  });

  const cancelGathering = () => {
    if (
      window.confirm(
        t("gatherings:manage.cancelConfirm", {
          title: gathering.title,
          count: ATTENDEE_COUNT,
        }),
      )
    ) {
      cancelEvent.mutate();
      navigate(gatheringCancelledPath(MANAGE_SLUG));
    }
  };

  const updateDetail = (id: string, value: string) => {
    setGathering((g) => ({
      ...g,
      details: g.details.map((detail) =>
        detail.id === id ? { ...detail, value } : detail,
      ),
      ...(id === "date" ? { date: value } : {}),
      ...(id === "venue" ? { location: value } : {}),
    }));
    // Map the edited detail onto the closest UpdateEventDto field.
    if (id === "venue") updateEvent.mutate({ venue: value });
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.header}>
            <div className={styles.eyebrow}>
              <div className={styles.phDot} /> {t("gatherings:manage.eyebrow")}
            </div>
            <div className={styles.title}>{renderTitle(gathering.title)}</div>
            <div className={styles.phRow}>
              <div className={styles.status}>
                <div className={styles.statusDot} />{" "}
                {t("gatherings:manage.status.approvedDaysToGo", { count: 12 })}
              </div>
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  className={styles.actionBtn}
                  onClick={() => setEditOpen(true)}
                >
                  {t("gatherings:manage.actions.editDetails")}
                </Button>
                <Button
                  variant="ghost"
                  className={styles.actionBtn}
                  onClick={() => setMessageOpen(true)}
                >
                  {t("gatherings:manage.actions.messageAttendees")}
                </Button>
                <Button
                  variant="primary"
                  className={styles.actionBtn}
                  to={gatheringDashboardPath(MANAGE_SLUG)}
                >
                  {t("gatherings:manage.actions.dayOfDashboard")} →
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.layout}>
            <ManageGatheringTabs
              slug={MANAGE_SLUG}
              onCancel={cancelGathering}
              details={gathering.details}
              description={gathering.description}
              onUpdateDetail={updateDetail}
              onUpdateDescription={(value) =>
                setGathering((g) => ({ ...g, description: value }))
              }
            />
            <ManageGatheringSidebar
              onCopyLink={() =>
                showToast(t("gatherings:manage.linkCopiedToast"), "success")
              }
            />
          </div>
        </div>
      </div>

      {editOpen && (
        <EditDetailsModal
          initial={{
            title: gathering.title,
            date: gathering.date,
            location: gathering.location,
            description: gathering.description,
          }}
          onClose={() => setEditOpen(false)}
          onSave={(draft) => {
            setGathering((g) => ({
              ...g,
              title: draft.title,
              date: draft.date,
              location: draft.location,
              description: draft.description,
              details: g.details.map((detail) =>
                detail.id === "date"
                  ? { ...detail, value: draft.date }
                  : detail.id === "venue"
                    ? { ...detail, value: draft.location }
                    : detail,
              ),
            }));
            updateEvent.mutate({
              title: draft.title,
              description: draft.description,
              venue: draft.location,
            });
          }}
        />
      )}

      {messageOpen && (
        <MessageAttendeesModal
          attendeeCount={ATTENDEE_COUNT}
          onClose={() => setMessageOpen(false)}
        />
      )}
    </PageShell>
  );
}
