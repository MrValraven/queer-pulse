import { StudioCreatorShell } from './StudioCreatorShell'
import { UPLOAD_STEPS } from './studioUpload.data'
import { UploadMainCol, UploadSidebar } from './StudioUploadSections'
import s from './creator.module.css'

export function StudioUploadPage() {
  return (
    <StudioCreatorShell>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>New release · upload</div>
          <h1>
            Bring it <em>home.</em>
          </h1>
          <div className="sub" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'rgba(247,243,238,.62)', marginTop: 14 }}>
            Drop the masters. We transcode, you keep the originals. Three steps, about eight minutes.
          </div>
        </div>
      </section>

      <div className={s.stepper}>
        {UPLOAD_STEPS.map((st) => (
          <div key={st.num} className={[s.step, st.on && s.stepOn].filter(Boolean).join(' ')}>
            <span className={s.stepNum}>{st.num}</span>
            <span className={s.stepNm}>
              {st.nm}
              <small>{st.sub}</small>
            </span>
          </div>
        ))}
      </div>

      <section className={s.body}>
        <UploadMainCol />
        <UploadSidebar />
      </section>
    </StudioCreatorShell>
  )
}
