import { Cursor } from './Cursor'
import styles from './AnimatedString.css'

export function AnimatedString({ string = '', delayMultiplier = 0.05 }) {
  const [generatedString, setString] = React.useState('')
  const stringArray = string.split('')


  function appendString() {
    if (stringArray.length > 0) {
      setString((string) => string + stringArray.shift())
      setTimeout(appendString, delayMultiplier * 1000)
    }
  }

  React.useEffect(() => {
    appendString()
  }, [])


  return (
    <>
      <div className={styles.String}>
        {generatedString}
        {/* <Cursor /> */}
      </div>
    </>
  )
}
