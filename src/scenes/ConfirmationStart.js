import { AnimatedString } from '/components/effects/AnimatedString'
import styles from './ConfirmationStart.css'

export function ConfirmationStart() {
  const introText = 'Welcome traveler. Venture forth into a digital adventure. Where relics of the past hold secrets untold.'

  return (
    <div className={styles.component}>
      <AnimatedString string={introText} delayMultiplier={0.015} />
      <div className={styles.buttons}>
        <p>[GREEN / LEFT] Initiate protocol</p>
      </div>
    </div>
  )
}
