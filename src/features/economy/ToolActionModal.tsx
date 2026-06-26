import { useEffect } from 'react'
import { Button } from '../../shared/components/ui'
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from './ModalKit'
import styles from './ApplicationModals.module.css'

export interface ToolInfo {
  title: string
  desc: string
  cta: string
}

/** Is this CTA a download (vs. a guide to read)? */
function isDownload(cta: string) {
  return /download|\.docx|\.xlsx|\.pdf/i.test(cta)
}

/**
 * Confirmation modal for a freelance tool CTA. Auto-starts a brief "preparing"
 * flow on mount, then resolves to a plum success panel. Mock — no real file.
 */
export function ToolActionModal({ tool, onClose }: { tool: ToolInfo; onClose: () => void }) {
  const download = isDownload(tool.cta)
  const { sending, done, submit } = useSubmitFlow()

  useEffect(() => {
    submit(undefined, 900)
    // submit identity is stable for the modal's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={download ? 'Your file is' : 'Guide'}
          em={download ? 'ready.' : 'opened.'}
          onClose={onClose}
          closeLabel="Done"
        >
          <strong>{tool.title}</strong> {download ? 'has been prepared for you' : 'is ready to read'}.
          It's free, lawyer-reviewed, and written by and for queer freelancers in Portugal — share it
          with anyone who needs it.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Freelance tools</div>
          <h2 className={styles.title}>{tool.title}</h2>
          <p className={styles.sub}>{tool.desc}</p>
          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              Cancel
            </button>
            <Button variant="primary" size="lg" disabled aria-busy={sending}>
              <Sending label={download ? 'Preparing file…' : 'Opening guide…'} />
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  )
}
