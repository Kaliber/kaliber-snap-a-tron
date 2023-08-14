import styles from './Image.css'

export function Image({ src }) {
  return (
    <div className={styles.image}>
      <img {...{ src }} alt="alt" />
    </div>
  )
}

export function FullSizeImage({ src }) {
  return (
    <div className={styles.fullSizeImage}>
      <img className={styles.fullSizeSrc} {...{ src }} alt="alt" />
    </div>
  )
}
