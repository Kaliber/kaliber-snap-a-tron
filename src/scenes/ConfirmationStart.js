import { AnimatedString } from '/components/effects/AnimatedString'
import styles from './ConfirmationStart.css'

export function ConfirmationStart() {
  const introText = 'Welcome traveler. Venture forth into a digital adventure. Where relics of the past hold secrets untold. Follow the instructions closely and connect the past with the future to create your own AI portrait. Are you ready?'

  return (
    <div className={styles.component}>
      <AnimatedString string={introText} delayMultiplier={0.015} />
      <div className={styles.buttons}>
        <p>Press [GREEN / LEFT] to initiate protocol</p>
      </div>
    </div>
  )
}
