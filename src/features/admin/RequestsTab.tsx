import { useState } from "react";
import { FiCheck, FiX, FiSearch } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useReviewJoinRequest } from "../communities/api/useCommunityMutations";
import { useJoinRequests } from "../communities/api/useJoinRequests";
import { photoOf } from "../communities/communityPeople";
import styles from "./ModPanel.module.css";

export function RequestsTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  // Live: GET /communities/:slug/join-requests (real ids); demo: the flagship's
  // mock queue. Either way the review PATCH below now carries a real id.
  const incoming = useJoinRequests(slug);
  const reviewRequest = useReviewJoinRequest(slug);
  // Track which requests the moderator has already actioned this session and
  // hide them, rather than snapshotting the list once — so a live queue that
  // arrives after the first render still shows, and optimistic removals stick.
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const requests = incoming.filter((r) => !resolvedIds.includes(r.id));
  const filtered = requests.filter((r) =>
    r.person.name.toLowerCase().includes(search.toLowerCase()),
  );

  const resolveRequest = (id: string, name: string, approved: boolean) => {
    setResolvedIds((prev) => [...prev, id]);
    reviewRequest.mutate({ id, action: approved ? "approve" : "decline" });
    showToast(
      t(
        approved
          ? "admin:modPanel.requests.approvedToast"
          : "admin:modPanel.requests.declinedToast",
        { name },
      ),
      approved ? "success" : "info",
    );
  };

  const approveAll = () => {
    for (const r of requests) {
      reviewRequest.mutate({ id: r.id, action: "approve" });
    }
    setResolvedIds((prev) => [...prev, ...requests.map((r) => r.id)]);
    showToast(
      t("admin:modPanel.requests.approvedAllToast", {
        count: requests.length,
      }),
      "success",
    );
  };

  return (
    <div>
      <div className={styles.searchRow}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          className={styles.search}
          aria-label={t("admin:modPanel.requests.searchPlaceholder")}
          placeholder={t("admin:modPanel.requests.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {requests.length > 1 && (
        <div className={styles.bulkRow}>
          <Button variant="jade" onClick={approveAll}>
            <FiCheck aria-hidden />{" "}
            {t("admin:modPanel.requests.approveAllCta", {
              count: requests.length,
            })}
          </Button>
        </div>
      )}
      <div className={styles.secLbl}>
        {t("admin:modPanel.requests.sectionLabel")}{" "}
        {requests.length > 0 && (
          <span className={styles.tabCount}>{requests.length}</span>
        )}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:modPanel.requests.emptyTitle")}
          description={t("admin:modPanel.requests.emptyDesc")}
        />
      ) : (
        filtered.map((r) => (
          <div className={styles.modRow} key={r.id}>
            <Avatar
              initials={r.person.initials}
              tint={r.person.tint}
              src={photoOf(r.person, demoMode)}
              size={42}
              alt={r.person.name}
            />
            <div className={styles.modMain}>
              <div className={styles.modName}>{r.person.name}</div>
              {r.note && <div className={styles.modNote}>"{r.note}"</div>}
              <div className={styles.modMeta}>
                {t("admin:modPanel.requests.requestedAgo", { time: r.time })}
              </div>
            </div>
            <div className={styles.modActions}>
              <Button
                variant="jade"
                onClick={() => resolveRequest(r.id, r.person.name, true)}
              >
                <FiCheck aria-hidden />{" "}
                {t("admin:modPanel.requests.approveCta")}
              </Button>
              <span
                role="button"
                tabIndex={0}
                className={styles.declineBtn}
                onClick={() => resolveRequest(r.id, r.person.name, false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resolveRequest(r.id, r.person.name, false);
                  }
                }}
              >
                <FiX aria-hidden /> {t("admin:modPanel.requests.declineCta")}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
