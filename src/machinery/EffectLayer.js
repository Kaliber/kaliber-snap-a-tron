import { useEventEmitter } from './EventEmitter'
// eslint-disable-next-line @kaliber/naming-policy
import styles from '/components/visual/SceneEffects.css'

export function EffectLayer({ children }) {
  const [showing, setShowing] = React.useState(true)
  const [input] = useEventEmitter()
  const effects = cx(styles.effects, styles.SizeGlitch)


  React.useEffect(() => {
    const key = Object.keys(input)
    if (key[0] === ' ') {
      setShowing(!showing)
    }
  }, [input])

  if (!showing) {
    return (
      <div>
        {children}
      </div>
    )
  }

  return (
    <>
      <div className={effects}>
        {children}
      </div>
    </>
  )
}
