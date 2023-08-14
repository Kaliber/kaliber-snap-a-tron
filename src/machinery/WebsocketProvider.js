import { DATA, IMAGE_PROCESSED, PHONE_DATA, PROCES_STEP } from './WebsocketEvents'

const websocketContext = React.createContext(null)

function useWebSocket({ config }) {
  return React.useMemo(
    () => {
      console.log('useWebSocket')
      const socket = new WebSocket(`ws://${config.host}:${config.port}`)
      return socket
    },
    [config]
  )
}

export function WebsocketProvider({ websocket, children }) {
  const socket = useWebSocket({ config: websocket })
  const [data, setData] = React.useState({})

  React.useEffect(
    () => {
      if (!socket) return
      socket.onmessage = ({ data: input }) => {
        const { event, data } = JSON.parse(input)

        switch (event) {
          case DATA:
            setData((x) => ({ ...x, connected: true, data }))
            break
          case PROCES_STEP:
            setData((x) => ({ ...x, percentage: data.percentage }))
            break
          case IMAGE_PROCESSED:
            setData((x) => ({ ...x, output: { src: data.src, srcBase64: data.srcBase64 } }))
            break
          case PHONE_DATA:
            setData((x) => ({ ...x, phone: data }))
            console.log(data)
            break
          default:
            console.log('Unknown event', data.event)
            break
        }
      }

      socket.onclose = () => {
        setData({ connected: false })
      }

      socket.onerror = () => {
        setData({ connected: false })
      }

      return () => {
        socket.close()
      }
    },
    [socket]
  )

  function sendDataToSocket(object) {
    if (!socket) return

    const data = JSON.stringify(object)
    socket.send(data)
  }

  return <websocketContext.Provider value={[data, sendDataToSocket]} {...{ children }} />
}

export function useWebsocketData() {
  const data = React.useContext(websocketContext)
  return data
}
