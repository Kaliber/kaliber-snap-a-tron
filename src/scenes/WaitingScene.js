
import { useWebsocketData } from '/machinery/WebsocketProvider'
import { HANDLE_LED } from '/machinery/WebsocketEvents'
import logo from '/assets/logo-pixel.png'
import styles from './WaitingScene.css'

export function WaitingScene() {
  const [{ }, send] = useWebsocketData()

  React.useEffect(() => {
    const randomLEDs = setInterval(() => {
      send({ event: HANDLE_LED, data: {
        category1: LEDState(), category2: LEDState(), category3: LEDState(),
        categoryOptions1: LEDState(), categoryOptions2: LEDState(), categoryOptions3: LEDState()
      } })
    }, 2500)


    return () => {
      clearInterval(randomLEDs)
    }
  }, [])
  return (
    <div style={{ height: '95vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <img className={styles.Logo} src={logo} width="500px" alt="logo" />
    </div>
  )
}

function LEDState() {
  const random = Math.floor(Math.random() * 3)
  return random
}
