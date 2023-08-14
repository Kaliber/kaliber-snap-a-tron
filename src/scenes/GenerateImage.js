import { useWebsocketData } from '/machinery/WebsocketProvider'
import { IMAGE_CAPTURED, PRINT_IMAGE } from '/machinery/WebsocketEvents'
import { useEventEmitter } from '/machinery/EventEmitter'
import styles from './GenerateImage.css'

export function GenerateImage() {
  const [{ output, percentage }, send] = useWebsocketData()
  const [input, setEvent] = useEventEmitter()
  const [ableToPrint, setAbleToPrint] = React.useState(false)
  const [rotateProgress, setRotateProgress] = React.useState(0)
  const [progressBar, setProgressBar] = React.useState(0)
  const [progressText, setProgressText] = React.useState('Waking up machine...')
  const [showPrint, setShowPrint] = React.useState(null)
  const [thankYouScreen, setThankYouScreen] = React.useState(false)
  const [reboot, setReboot] = React.useState(false)
  const [cantRead, setCantRead] = React.useState(false)
  const [generateProgress, setGenerateProgress] = React.useState(1)

  React.useEffect(() => {
    if (generateProgress) {
      setShowPrint(false)
      if (generateProgress < 100) {
        setProgressBar(generateProgress)
      }

      if (generateProgress === 100 && output && !showPrint) {
        setTimeout(() => {
          localStorage.setItem('generated', 'true')
          setAbleToPrint(true)
          setShowPrint(true)
        }, 1500)
      }
    }
    return () => {}
  }, [generateProgress, output])

  React.useEffect(() => {
    if (percentage && !showPrint) {
      setGenerateProgress(percentage)
    }
    return () => { }
  }, [percentage])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgressText(getGenerationText())
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  React.useEffect(() => {
    setShowPrint(false)
    setGenerateProgress(0)
    const imageFromLocalStorage = localStorage.getItem('picture')
    const promptLocalStorage = JSON.parse(localStorage.getItem('prompt'))
    if (imageFromLocalStorage) {
      send({ event: IMAGE_CAPTURED, data: { blob: imageFromLocalStorage, prompt: promptLocalStorage } })
    }
  }, [])

  React.useEffect(() => {
    if (localStorage.getItem('wipe')) {
      return
    }

    function handlePrintImage() {
      send({
        event: PRINT_IMAGE,
        data: { filePath: output.src }
      })
    }
    if (!thankYouScreen && ableToPrint) {
      if (input.forward) {
        setRotateProgress(rotateProgress + 20)
      }
      if (input.backward && rotateProgress >= 0) {
        setRotateProgress(rotateProgress - 20)
      }

      if (input.buttonPressed === 'green') {
        setCantRead(true)
      }

      if (rotateProgress >= 100) {
        setRotateProgress(0)
        setAbleToPrint(false)
        setThankYouScreen(true)
        handlePrintImage()
      }
    }
    if (input.buttonPressed === 'green' && thankYouScreen) {
      setReboot(true)
      setTimeout(() => {
        setEvent('reboot')
      }, 800)
    }

    if (input.buttonPressed === 'red' && showPrint) {
      setEvent('backToPrompt')
    }

    return () => { }
  }, [input])


  return (
    <div>
      {!showPrint &&
      <>
        <audio autoPlay loop>
          <source src="/assets/sounds/generate_new.wav" type="audio/wav" />
        </audio>

        <div className={styles.loadingContainer}>
          <div className={styles.loadingInner}>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarInner} style={{ width: progressBar + '%' }} />
            </div>
            <p>{progressText}</p>
            <p>Tip: Patience is a virtue</p>
          </div>
        </div>
      </>
      }

      {reboot &&
      <div className={styles.rebootContainer}>
        <audio autoPlay loop>
          <source src="/assets/sounds/reboot.wav" type="audio/wav" />
        </audio>
        <div className={styles.rebootAnimation} />
      </div>
      }

      {!reboot &&
      <>
        {thankYouScreen &&
          <div className={styles.thankYouContainer}>

            <h1>Thank you! ヽ(•‿•)ノ</h1><br />
            <p>
              Image is being printed.<br />
              Please remove the connections or your photo will be used to train our new T-3000 model (ಠ_ಠ).
            </p>
            <div className={styles.Buttons}>
              <p>[GREEN / LEFT] start over</p>
            </div>
          </div>
        }

        {showPrint &&
        <div className={styles.outputWrapper}>
          <div className={styles.outputContainer} style={{ transform: `translateY(${rotateProgress}vh)` }}>
            {output && <img className={styles.outputImage} src={output.srcBase64} alt="overlay" /> }
          </div>
          <div className={styles.outputText}>
            <p>Thank you for participating in this trial. If you are happy with the result please send the picture to the printer by turning the wheel clock-wise. If not press the [RED / RIGHT] button to enter a different prompt.</p>
            {cantRead && <h2 className={styles.turnText}>TURN THE WHEEL TO PRINT!</h2>}
          </div>
        </div>
        }
      </>
      }
    </div>
  )
}

function getGenerationText() {
  const strings = [
    'Generating image...',
    'Allocating RAM...',
    'Rebooting TARS',
    'M.O.D.I.F.Y.I.N.G. image...',
    'Gettings parameters for model...',
    'Transforming image...',
    'Deploying neural network... ',
    'Establishing dimensional link...',
    'Harnessing temporal distortion...',
    'Reversing polarity...',
    'Powering up photon emitters...',
  ]

  return strings[Math.floor(Math.random() * strings.length)]
}
