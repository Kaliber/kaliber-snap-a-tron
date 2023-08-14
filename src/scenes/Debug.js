import { useClientConfig } from '/machinery/ClientConfig'
import { useWebsocketData } from '/machinery/WebsocketProvider'
import styles from './Debug.css'

export function Debug() {
  const [{ data }] = useWebsocketData()
  const config = useClientConfig()

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div>
          <Bank array={Object.values(data?.input?.input_2 ?? {})} />
          <Bank array={Object.values(data?.input?.input_3 ?? {})} />
          <Bank array={Object.values(data?.input?.input_4 ?? {})} />
        </div>

        <div>
          <Bank array={Object.values(data?.input?.category ?? {})} inverted />
        </div>
      </div>

      <p>Encoder: {data?.input?.encoder}</p>

      <div>GREEN: {data?.input?.buttons?.green}</div>
      <div>RED: {data?.input?.buttons?.red}</div>

      <div>Distance: {data?.input?.distance}</div>
      <div>Person detected: {data?.input?.distance < config.settings.personDetectionThresHold ? 'person' : 'no person'}</div>
    </div>
  )
}

function Bank({ array, inverted }) {
  return (
    <div style={{ display: 'grid', gap: 5, gridTemplateColumns: 'repeat(10, 45px)', padding: 20, backgroundColor: 'black' }}>
      {array.map((x, xid) => {
        return (
          <div key={xid} style={{
            height: 45,
            width: 45,
            borderRadius: 45,
            backgroundColor: inverted
              ? x ? 'silver' : 'green'
              : x ? 'green' : 'silver'
          }} />
        )
      })}
    </div>
  )
}
