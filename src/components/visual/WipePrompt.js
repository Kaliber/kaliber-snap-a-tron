import styles from './WipePrompt.css'

export function WipePrompt() {
  return (
    <div className={styles.Container}> 
      <div className={styles.Inner}>
        <p>It seems that we lost you. Would you like to proceed or start over?</p>
        <div className={styles.Buttons}>
          <p>[GREEN / LEFT] Wipe data</p> <p>[RED / RIGHT] Return to process</p>
        </div>
      </div>
    </div>
  )
}
