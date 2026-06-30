import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
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
import styles from "./ManageGatheringPage.module.css";

interface GatheringState {
  title: string;
  date: string;
  location: string;
  description: string;
  details: { label: string; value: string }[];
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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  const dateDetail =
    GATHERING_DETAILS.find((d) => d.label === "Date")?.value ?? "";
  const venueDetail =
    GATHERING_DETAILS.find((d) => d.label === "Venue")?.value ?? "";

  const [gathering, setGathering] = useState<GatheringState>({
    title: GATHERING_TITLE,
    date: dateDetail,
    location: venueDetail,
    description: GATHERING_DESCRIPTION,
    details: GATHERING_DETAILS,
  });

  const cancelGathering = () => {
    if (
      window.confirm("Cancel Pride Brunch? All 14 attendees will be notified.")
    ) {
      navigate(routes.gatheringCancelled);
    }
  };

  const updateDetail = (label: string, value: string) =>
    setGathering((g) => ({
      ...g,
      details: g.details.map((d) => (d.label === label ? { ...d, value } : d)),
      ...(label === "Date" ? { date: value } : {}),
      ...(label === "Venue" ? { location: value } : {}),
    }));

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.header}>
            <div className={styles.eyebrow}>
              <div className={styles.phDot} /> Hosting
            </div>
            <div className={styles.title}>{renderTitle(gathering.title)}</div>
            <div className={styles.phRow}>
              <div className={styles.status}>
                <div className={styles.statusDot} /> Approved · 12 days to go
              </div>
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  className={styles.actionBtn}
                  onClick={() => setEditOpen(true)}
                >
                  Edit details
                </Button>
                <Button
                  variant="ghost"
                  className={styles.actionBtn}
                  onClick={() => setMessageOpen(true)}
                >
                  Message attendees
                </Button>
                <Button
                  variant="primary"
                  className={styles.actionBtn}
                  to={routes.gatheringDashboard}
                >
                  Day-of dashboard →
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.layout}>
            <ManageGatheringTabs
              onCancel={cancelGathering}
              details={gathering.details}
              description={gathering.description}
              onUpdateDetail={updateDetail}
              onUpdateDescription={(value) =>
                setGathering((g) => ({ ...g, description: value }))
              }
            />
            <ManageGatheringSidebar
              onCopyLink={() => showToast("Link copied!", "success")}
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
          onSave={(draft) =>
            setGathering((g) => ({
              ...g,
              title: draft.title,
              date: draft.date,
              location: draft.location,
              description: draft.description,
              details: g.details.map((d) =>
                d.label === "Date"
                  ? { ...d, value: draft.date }
                  : d.label === "Venue"
                    ? { ...d, value: draft.location }
                    : d,
              ),
            }))
          }
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
