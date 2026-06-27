import s from './funding.module.css'

/** Mirrors the StudioOpenCallCard layout exactly so there's no layout shift on load. */
export function StudioOpenCallSkeleton() {
  return (
    <div className={s.call}>
      <div className={s.callTop}>
        <div className={s.callCur}>
          <span className={`${s.av} ${s.skel}`} style={{ borderRadius: '50%' }} />
          <div>
            <div className={`${s.skel}`} style={{ width: 90, height: 13 }} />
            <div className={`${s.skel}`} style={{ width: 64, height: 10, marginTop: 7 }} />
          </div>
        </div>
        <div className={s.callMain}>
          <div className={`${s.skel}`} style={{ width: 110, height: 18, borderRadius: 999 }} />
          <div className={`${s.skel}`} style={{ width: '70%', height: 20, marginTop: 12 }} />
          <div className={`${s.skel}`} style={{ width: '95%', height: 13, marginTop: 12 }} />
          <div className={`${s.skel}`} style={{ width: '85%', height: 13, marginTop: 7 }} />
        </div>
        <div className={s.callAmt}>
          <div className={`${s.skel}`} style={{ width: 64, height: 28 }} />
          <div className={`${s.skel}`} style={{ width: 32, height: 10, marginTop: 7 }} />
        </div>
      </div>
    </div>
  )
}
