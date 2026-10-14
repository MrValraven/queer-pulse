import { useMemo } from "react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import {
  buildUploadSideInfo,
  buildUploadSideInfoLive,
} from "./studioUpload.data";
import {
  StudioPreviewLinkPanel,
  canShowPreviewLink,
} from "./StudioPreviewLinkPanel";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./creator.module.css";

export function UploadSidebar({
  release,
  isShow = false,
}: {
  release: StudioReleaseView | null;
  /** A show's upload hides the music-only hints (WAV, ISRC, lyrics). */
  isShow?: boolean;
}) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const sideInfo = useMemo(
    () =>
      isShowcase ? buildUploadSideInfo(t) : buildUploadSideInfoLive(t, isShow),
    [isShowcase, isShow, t],
  );
  return (
    <div className={s.col}>
      <Collapse isOpen={release !== null && canShowPreviewLink(release)}>
        {/* The inner check only narrows the type; Collapse carries the motion. */}
        {release && (
          <div className={s.sideCard}>
            <StudioPreviewLinkPanel release={release} />
          </div>
        )}
      </Collapse>
      {sideInfo.map((info) => (
        <Collapse key={info.eyebrow} isOpen={!(isShow && isShowcase)}>
          <div className={s.sideCard}>
            <div className={s.sideEb}>{info.eyebrow}</div>
            <h4>{info.title}</h4>
            <p>{info.body}</p>
            <ul className={s.sideList}>
              {info.list.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  {item.em ? <em>{item.value}</em> : item.value}
                </li>
              ))}
            </ul>
          </div>
        </Collapse>
      ))}
    </div>
  );
}
