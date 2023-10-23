import { LoadingBar } from '/components/visual/LoadingBar'
import { PlaySound } from '/machinery/SoundController'
import video from '/assets/videos/MAIN.mp4'
import styles from './SceneVideo.css'
import { useEventEmitter } from '/machinery/EventEmitter'
import { useWebsocketData } from '/machinery/WebsocketProvider'

export function SceneVideo() {
  const [events, setEvent] = useEventEmitter()
  const [{ phone }] = useWebsocketData()
  const videoRef = React.useRef(null)

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('canplaythrough', () => {
        videoRef.current.play()
      })

      videoRef.current.addEventListener('ended', () => {
        setEvent('videoEnded')
      })
    }
  }, [])

  React.useEffect(() => {
    if (phone) {
      if (phone.horn) {
        setEvent('stopMovie')
      }
    }
  }, [phone])

  return (
    <div className={styles.component}>
      <video ref={videoRef} className={styles.video} autoPlay>
        <source src={video} type="video/mp4" />
      </video>
    </div>
  )
}
