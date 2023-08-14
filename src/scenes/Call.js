import { RING_PHONE, MUTE_PHONE } from '/machinery/WebsocketEvents'
import { useWebsocketData } from '/machinery/WebsocketProvider'

export function Call() {
  const [{ phone }, send] = useWebsocketData()

  return (
    <div>
      <pre>{JSON.stringify(phone)}</pre>
      <button onClick={handleCall}>Call</button>
      <button onClick={handleHangUp}>Hang up</button>
    </div>
  )

  function handleCall() {
    send({ event: RING_PHONE })
  }

  function handleHangUp() {
    send({ event: MUTE_PHONE })
  }
}
