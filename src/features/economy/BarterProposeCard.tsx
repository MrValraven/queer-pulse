import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { BarterQuestionModal } from './BarterQuestionModal'
import styles from './BarterDetailPage.module.css'

export function BarterProposeCard({ name, firstName }: { name: string; firstName: string }) {
  const { showToast } = useToast()
  const [message, setMessage] = useState('')
  const [asking, setAsking] = useState(false)

  function send() {
    if (!message.trim()) {
      showToast('Add a line about what you’d trade.', 'error')
      return
    }
    setMessage('')
    showToast(`Swap proposed to ${name}.`, 'success')
  }

  return (
    <div className={`${styles.sideCard} ${styles.proposeCard}`}>
      <div className={styles.proposeHead}>
        <h4>Propose a swap</h4>
        <div className={styles.lead}>
          No money — <em>just a trade.</em>
        </div>
      </div>
      <div className={styles.proposeBody}>
        <textarea
          className={styles.proposeTextarea}
          placeholder={`Tell ${firstName} what you’d offer in return, and why this swap works for you.`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className={styles.proposeActions}>
          <Button variant="primary" onClick={send} style={{ width: '100%', justifyContent: 'center' }}>
            Send proposal →
          </Button>
          <Button
            variant="ghost"
            onClick={() => setAsking(true)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Ask a question first
          </Button>
        </div>
        <p className={styles.proposeFoot}>
          Nothing is agreed until you both say yes. Swaps are between members — QueerPulse never takes a
          cut.
        </p>
      </div>

      {asking && (
        <BarterQuestionModal name={name} firstName={firstName} onClose={() => setAsking(false)} />
      )}
    </div>
  )
}
