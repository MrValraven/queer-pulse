import {
  Avatar,
  Badge,
  Button,
  VisibilityBadge,
} from "../../shared/components/ui";
import { KIND_LABELS } from "./subprofile-kinds";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { LINK_BADGE, STATUS_BADGE } from "./mySubprofiles.data";
import styles from "./MySubprofilesPage.module.css";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * One persona row on the dashboard: avatar, name, and the badges that tell the
 * owner its state at a glance (kind, draft/published, linked/standalone,
 * who-can-see-it), plus Edit and Delete actions.
 */
export function MySubprofileRow({
  subprofile,
  onDelete,
}: {
  subprofile: SubprofileView;
  onDelete: (subprofile: SubprofileView) => void;
}) {
  const status = STATUS_BADGE[subprofile.status];
  const link = LINK_BADGE[subprofile.linkVisibility];
  const editPath = `/account/subprofiles/${subprofile.id}/edit`;

  return (
    <article className={styles.row}>
      <Avatar
        initials={initialsOf(subprofile.displayName)}
        src={subprofile.avatarUrl ?? undefined}
        tint="plum"
        size={52}
      />
      <div className={styles.rowMain}>
        <h2 className={styles.rowName}>
          {subprofile.displayName || "Untitled persona"}
        </h2>
        <div className={styles.rowBadges}>
          <Badge tone="ghost">{KIND_LABELS[subprofile.kind]}</Badge>
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
          <Badge tone={link.tone}>{link.label}</Badge>
          <VisibilityBadge mode={subprofile.visibility} />
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button variant="ghost" to={editPath}>
          Edit
        </Button>
        <Button variant="ghost" onClick={() => onDelete(subprofile)}>
          Delete
        </Button>
      </div>
    </article>
  );
}
