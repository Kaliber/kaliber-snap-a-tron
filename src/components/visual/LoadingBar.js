import styles from './LoadingBar.css'

export function LoadingBar({ duration, text = false }) {
  return (
    <>
      { text ? <div className={styles.text}>{text}</div> : null }
      <div className={styles.component}>
        <div className={styles.innerBar} style={{ animationDuration: `${duration}s` }} />
      </div>
    </>
  )
}
