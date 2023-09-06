import { useWebsocketData } from '/machinery/WebsocketProvider'
import { useEventEmitter } from '/machinery/EventEmitter'
import styles from './Picture.css'

export function Picture() {
  const videoRef = React.useRef()
  const canvasRef = React.useRef()
  const [input, setEvent] = useEventEmitter()


  const [preview, setPreview] = React.useState(null)
  const [allowPicture, setAllowpicture] = React.useState(false)
  const [processing, setProcessing] = React.useState(true)
  const [instructions, setInstructions] = React.useState(true)
  const [takePicture, setTakePicture] = React.useState(false)
  const [flash, setFlash] = React.useState(false)
  const [countdown, setCountdown] = React.useState('3..')
  const [showCountdown, setShowCountdown] = React.useState(false)
  const [{ output, data }, send] = useWebsocketData()
  const width = 512
  const height = 512

  React.useEffect(() => {
    if (takePicture) {
      setTakePicture(false)
      setShowCountdown(true)
      setFlash(false)
      setTimeout(() => {
        setCountdown('2.. get ready!')
      }, 1000)

      setTimeout(() => {
        setCountdown('1.. smile!')
      }, 2000)

      setTimeout(() => {
        setCountdown('Captured!')
        setShowCountdown(false)
        handleTakePicture()
      }, 3000)
    }

    function handleTakePicture() {
      const canvas = canvasRef.current
      if (!canvas) return
      if (preview) return
      const context = canvas.getContext('2d')
      context.scale(-1, 1)
      context.drawImage(videoRef.current, 0, 0, -width, height)
      const blob = canvas.toDataURL('image/png')
      localStorage.removeItem('picture')
      localStorage.setItem('picture', blob)
      setFlash(true)
      setPreview(true)
      setTimeout(() => {
        setProcessing(false)
      }, 1000)
    }
  }, [canvasRef, videoRef, send, takePicture])

  React.useEffect(
    () => {
      if (!videoRef.current || !navigator.mediaDevices.getUserMedia) return

      navigator.mediaDevices.getUserMedia({ video: { width, height } })
        .then((stream) => { videoRef.current.srcObject = stream })
        .catch((e) => { console.error(e) })

      return () => { }
    },
    []
  )


  React.useEffect(() => {
    if (localStorage.getItem('wipe')) {
      return
    }
    if ((input.buttonPressed === 'red' || input.b) && preview && !processing) {
      setPreview(false)
      setProcessing(true)
      setTakePicture(false)
    }
    if ((input.buttonPressed === 'green' || input.p) && preview && !processing && !instructions) {
      setEvent('goToPrompt')
    }

    if ((input.buttonPressed === 'green' || input.p)) {
      setCountdown('3..')
      setTakePicture(true)
    }
  }, [input])

  return (
    <div>
      { flash &&
      <>
        <div className={styles.flash} />
        <audio autoPlay>
          <source src="/assets/sounds/removed.wav" type="audio/wav" />
        </audio>
      </>
      }

      <div className={styles.videoContainer}>
        <div className={styles.video} style={{ display: (!preview ? 'block' : 'none'), opacity: (!instructions ? '1' : '0.7') }}>
          <video style={{ transform: 'scaleX(-1)' }} id="video" {...{ width, height }} autoPlay ref={videoRef} />
          { !instructions && <p className={styles.actionText}>[GREEN / LEFT] Take photo</p> }
          { showCountdown &&
            <div className={styles.countDown}>
              <p>{countdown}</p>
            </div>
          }
        </div>
        { (instructions && !preview && !showCountdown) &&
        <div className={styles.videoInstructions}>
          <p>Thanks for listening. You can put the phone down. <br /><br /> First, we are going to take a photo. Look into the camera and press the [GREEN BUTTON] to capture yourself.</p>
        </div>
        }
      </div>

      <div style={{ display: (preview ? 'flex' : 'none') }} className={styles.confirmationContainer}>
        <div className={styles.confirmationInner}>
          <div className={styles.confirmationCanvas}>
            <canvas ref={canvasRef} {...{ width, height }} />
          </div>
          <div className={styles.confirmationContent}>
            <p>Use this photo?</p>
            <div className={styles.Buttons}>
              <p>[GREEN / LEFT] Yes</p>
              <p>[RED / RIGHT] No</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )


}
