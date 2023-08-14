import { AnimatedString } from '/components/effects/AnimatedString'
import { RING_PHONE, MUTE_PHONE, HANDLE_LED } from '/machinery/WebsocketEvents'
import { Player } from '@lottiefiles/react-lottie-player'
import { LoadingBar } from '/components/visual/LoadingBar'
import video from '/assets/videos/INTRO.mp4'
import Tommy from '/assets/tommy_geel.json'
import styles from './DefaultScene.css'
import snapLogo from '/assets/logo-pixel.png'
import { useWebsocketData } from '/machinery/WebsocketProvider'
import { useEventEmitter } from '/machinery/EventEmitter'

export function DefaultScene() {
  const [loaded, isLoaded] = React.useState(false)
  const [{ phone }, send] = useWebsocketData()
  const [event, setEvent] = useEventEmitter()
  const [generatedString, setString] = React.useState('')
  const [showInstruction, setShowInstruction] = React.useState(false)
  const videoRef = React.useRef(null)

  const removalObjects = [
    'picture', 'wipe', 'generated', 'prompt'
  ]

  React.useEffect(() => {
    function handleClearLocalStorage() {
      removalObjects.forEach((object) => {
        localStorage.removeItem(object)
      })
    }

    send({ event: HANDLE_LED, data: {
      category1: 0, category2: 0, category3: 0,
      categoryOptions1: 0, categoryOptions2: 0, categoryOptions3: 0
    } })

    setTimeout(() => {
      send({ event: HANDLE_LED, data: {
        category1: 1, category2: 1, category3: 1,
        categoryOptions1: 1, categoryOptions2: 1, categoryOptions3: 1
      } })
    }, 500)

    setTimeout(() => {
      send({ event: HANDLE_LED, data: {
        category1: 0, category2: 0, category3: 0,
        categoryOptions1: 0, categoryOptions2: 0, categoryOptions3: 0
      } })
    }, 1000)

    handleClearLocalStorage()

    setTimeout(() => {
      isLoaded(true)
      appendText()
    }, 3000)

    setTimeout(() => {
      setShowInstruction(true)
      // ? disabled for annoying reasons
      // ! enable when prod
      handleCall()
    }, 5000)
  }, [])

  React.useEffect(() => {
    if (phone) {
      if (!phone.horn) {
        handleHangUp()
        setEvent('playMovie')
      }
    }
  }, [phone])

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('canplaythrough', () => {
        videoRef.current.play()
      })
    }

    if (loaded) {
      videoRef.current.play()
    }
  }, [showInstruction])


  function handleCall() {
    send({ event: RING_PHONE })
    setTimeout(() => {
      send({ event: MUTE_PHONE })
    }, 7000)
  }

  function handleHangUp() {
    send({ event: MUTE_PHONE })
  }

  const loadingStringArray = [
    'loaded tommy.protocol',
    'upload data to kaliber.net',
    'never stop exploring',
    'copyright 1956 - Kaliber Interactive B.V. (totally not Skynet) - all rights reserved',
  ]

  function appendText() {
    if (loadingStringArray.length > 0) {
      setString((string) => string + ' </br>' + loadingStringArray.shift())
      setTimeout(appendText, 300)
    }
  }

  if (!loaded) {
    return (
      <div className={styles.LoadingScreen}>
        <Player
          autoplay
          src={Tommy}
          speed={0.4}
          keepLastFrame
          style={{ height: '400px', width: '400px' }}
        />
        <LoadingBar duration={3} text="initiating tommy.protocol" />
      </div>
    )
  }

  if (showInstruction) {
    return (
      <div className={styles.videoComp}>
        <video ref={videoRef} className={styles.video} autoPlay loop>
          <source src={video} type="video/mp4" />
        </video>
      </div>
    )
  }

  return (
    <div className={styles.DefaultScene}>
      <img src={snapLogo} style={{ transform: 'translateX(-1.5rem)', marginBottom: '1rem' }} alt="logo" width="450px" />
      <br />
      v.0.0.1 - tommyalpha

      <br />
      <div dangerouslySetInnerHTML={{ __html: generatedString }} />
      <br />
      { showInstruction ? <AnimatedString string="pick up..." /> : ''}
    </div>
  )
}
