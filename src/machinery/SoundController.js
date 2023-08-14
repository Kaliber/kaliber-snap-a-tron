export function PlaySound({ sound, volume }) {
  React.useEffect(() => {
    if (sound) {
      const audio = new Audio(sound)
      audio.volume = volume
      audio.play()
    }
  }, [sound])
  return null
}
