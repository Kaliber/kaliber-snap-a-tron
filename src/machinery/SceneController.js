import { useEventEmitter } from './EventEmitter'
import { WaitingScene } from '/scenes/WaitingScene'
import { ConfirmationStart } from '/scenes/ConfirmationStart'
import { WipePrompt } from '/components/visual/WipePrompt'


export function SceneController({ scenes }) {
  const [activeScene, setActiveScene] = React.useState(scenes[0])
  const debug = false
  const [input] = useEventEmitter()

  const [events, appendEvents] = React.useState([]) // ? For debugging
  const [wipe, setWiping] = React.useState(false)
  const [confirm, setConfirm] = React.useState(false)

  React.useEffect(() => {

  }, [activeScene])
  React.useEffect(() => {
    // ? For debugging
    if (events && events.length > 3) {
      appendEvents(events => events.slice(1))
    }

    appendEvents(events => [...events, <div>{JSON.stringify(input)}</div>])

    // Check if video has ended and switch scene to next one
    if (input.videoEnded) {
      setActiveScene(scenes[2])
    }

    if (input.playMovie) {
      setActiveScene(scenes[1])
    }

    if (input.stopMovie) {
      setActiveScene(scenes[2])
    }

    if (input.Escape) {
      setActiveScene(scenes[2])
    }

    if (input.person && !activeScene) {
      setConfirm(true)
    }

    if (confirm && input.buttonPressed === 'green') {
      setActiveScene(scenes[0])
      setConfirm(false)
    }

    if (input.goToPrompt) {
      setActiveScene(scenes[3])
    }

    if (input.generateImage) {
      setActiveScene(scenes[4])
    }

    if (input.reboot) {
      setActiveScene(scenes[5])
    }

    if (input.startover) {
      setActiveScene(null)
    }

    if (input.backToPrompt) {
      setActiveScene(scenes[3])
    }

    if (input.personLeft && activeScene && activeScene !== scenes[5]) {
      setWiping(true)
      localStorage.setItem('wipe', 'true')
    }
  }, [input])

  React.useEffect(() => {
    if (wipe && input.buttonPressed === 'green') {
      setActiveScene(scenes[5])
      setWiping(false)
      localStorage.removeItem('wipe')
    }
    if (wipe && input.buttonPressed === 'red') {
      setWiping(false)
      localStorage.removeItem('wipe')
    }
  }, [wipe, input])


  if (activeScene) {
    return (
      <>
        {wipe && <WipePrompt />}
        {activeScene}
        { debug &&
          <div style={{ overflow: 'hidden', maxWidth: '100%'}}>
            <div style={{ display: 'flex', fontSize: '30px' }}>{events}</div>
          </div>
        }
      </>
    )
  } else if (confirm) {
    return (
      <ConfirmationStart />
    )
  } else {
    return (
      <>
        <WaitingScene />
        { debug &&
          <div style={{ overflow: 'hidden', maxWidth: '90%'}}>
            <div style={{ display: 'flex' }}>{events}</div>
          </div>
        }
      </>
    )
  }
}

