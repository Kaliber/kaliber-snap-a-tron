import { useWebsocketData } from '/machinery/WebsocketProvider'
import { LoadingBar } from '/components/visual/LoadingBar'
import { FullSizeImage } from '/components/visual/Image'
import styles from './SceneImage.css'

export function SceneImage() {
  const [showImage, setShowImage] = React.useState(false)
  const [image, setImage] = React.useState(null)
  const data = useWebsocketData()

  React.useEffect(() => {
    if (data.image && !showImage) {
      setImage(data.image)
      setShowImage(true)

      setTimeout(() => {
        setShowImage(false)
      }
      , 1000)
    }
  }, [data.image])

  return (
    <div className={styles.component}>
      { showImage ? <FullSizeImage src={image} /> :
      <LoadingBar duration={1} text='generating image...' />
      }
    </div>
  )
}
