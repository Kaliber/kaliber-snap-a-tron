import { useEventEmitter } from '../machinery/EventEmitter'
import { MockDebug } from './debug/MockDebug'
import { Player } from '@lottiefiles/react-lottie-player'
import { PlaySound } from '/machinery/SoundController'
import Tommy from '/assets/tommy_geel.json'
import styles from './Settings.css'

export function Settings() {
  const [input] = useEventEmitter()
  const [selected, setSelected] = React.useState(0)
  const [activeComponent, setActiveComponent] = React.useState(null)
  const clickAudio = new Audio('/assets/sounds/click.wav')
  clickAudio.volume = 0.5

  const settings = [
    {
      name: 'Websocket',
      component: <MockDebug />,
    },
    {
      name: 'Prompt',
    },
    {
      name: 'Audio',
    }
  ]


  PlaySound({ sound: '/assets/sounds/glitch.wav', volume: 0.1 })
  React.useEffect(() => {

    if ((input.backward || input.w) && !activeComponent) {
      if (selected > 0) {
        setSelected((selected) => selected - 1)
        clickAudio.play()
      }
    }
    if ((input.forward || input.s) && !activeComponent) {
      if (selected < settings.length - 1) {
        setSelected((selected) => selected + 1)
        clickAudio.play()
      }
    }
    if (input.buttonPressed === 'red' || input.q) {
      setActiveComponent(null)
    }
    if (input.buttonPressed === 'green' || input.Enter) {
      clickAudio.play()
      setActiveComponent(settings[selected].component)
    }
  }, [input])

  return (
    <div className={styles.component}>
      <div className={styles.svg}>
        <Player
          autoplay
          src={Tommy}
          speed={0.7}
          keepLastFrame
          style={{ height: '200px', width: '200px' }}
        />
      </div>

      {activeComponent && activeComponent}
      {!activeComponent && (
        <>
          <h1>Settings</h1>
          <br />
          <p>use the wheel and buttons for navigation</p>
          <br />
          <ul>
            {settings.map((setting, i) => (
              <li key={i} className={selected === i ? styles.selected : ''}>
                {setting.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
