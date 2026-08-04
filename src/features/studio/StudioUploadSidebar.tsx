import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { buildUploadSideInfo } from "./studioUpload.data";
import s from "./creator.module.css";

export function UploadSidebar() {
  const { t } = useTranslation();
  const sideInfo = useMemo(() => buildUploadSideInfo(t), [t]);
  return (
    <div className={s.col}>
      {sideInfo.map((info) => (
        <div key={info.eyebrow} className={s.sideCard}>
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
      ))}
    </div>
  );
}
