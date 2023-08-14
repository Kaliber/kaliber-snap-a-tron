import { useWebsocketData } from './WebsocketProvider'
import { useClientConfig } from '/machinery/ClientConfig'
import { CAT_ONE_MAP, CAT_TWO_MAP, CAT_THREE_MAP } from '/assets/Prompts'

const eventEmitterData = React.createContext(null)

export function EventEmitter({ children }) {
  const [data, setData] = React.useState({})
  const [oldValue, setOldValue] = React.useState(0)
  const [oldDistance, setOldDistance] = React.useState(0)
  const [personFound, setPersonFound] = React.useState(false)
  const [userPressed, setButtonPressed] = React.useState(false)

  const config = useClientConfig()
  const websocket = useWebsocketData()
  const websocketData = websocket[0]
  const buttons = websocketData?.data?.input?.buttons
  const encoder = websocketData?.data?.input?.encoder
  const distance = websocketData?.data?.input?.distance

  // ! Category / Prompt

  const category = websocketData?.data?.input?.category
  const cat_1 = category?.channle_0
  const cat_2 = category?.channle_1
  const cat_3 = category?.channle_2

  const firstInput = websocketData?.data?.input?.input_2
  const secondInput = websocketData?.data?.input?.input_3
  const thirdInput = websocketData?.data?.input?.input_4

  const firstInputArray = getSelectedValue({ array: Object.values(firstInput ?? {}) })
  const secondInputArray = getSelectedValue({ array: Object.values(secondInput ?? {}) })
  const thirdInputArray = getSelectedValue({ array: Object.values(thirdInput ?? {}) })

  function getSelectedValue({ array }) {
    let selected = []
    array.map((x, xid) => {
      if (x) {
        selected.push(xid)
      }
    })
    return selected
  }

  const checkFirstInput = firstInputArray.length > 0 ?? false
  const checkMultipleFirstInput = firstInputArray.length > 1 ?? false

  const checkSecondInput = secondInputArray.length > 0 ?? false
  const checkMultipleSecondInput = secondInputArray.length > 1 ?? false

  const checkThirdInput = thirdInputArray.length > 0 ?? false
  const checkMultipleThirdInput = thirdInputArray.length > 1 ?? false

  React.useEffect(() => {
    if (checkMultipleFirstInput) {
      setData({ tooManyFirst: true })
    } else if (checkFirstInput) {
      setData({ firstInput: CAT_ONE_MAP[firstInputArray[0]] })
    } else if (!checkFirstInput) {
      setData({ removedFirst: true })
    }
  }, [checkFirstInput, checkMultipleFirstInput])

  React.useEffect(() => {
    if (checkMultipleSecondInput) {
      setData({ tooManySecond: true })
    } else if (checkSecondInput) {
      setData({ secondInput: CAT_TWO_MAP[secondInputArray[0]] })
    } else if (!checkSecondInput) {
      setData({ removedSecond: true })
    }
  }, [checkSecondInput, checkMultipleSecondInput])

  React.useEffect(() => {
    if (checkMultipleThirdInput) {
      setData({ tooManyThird: true })
    } else if (checkThirdInput) {
      setData({ thirdInput: CAT_THREE_MAP[thirdInputArray[0]] })
    } else if (!checkThirdInput) {
      setData({ removedThird: true })
    }
  }, [checkThirdInput, checkMultipleThirdInput])

  function setEvent(event) {
    setData({ [event]: true })
  }

  // * Cat 1 listener
  React.useEffect(() => {
    setData({ categoryOne: cat_1 ?? false })
  }, [cat_1])

  // * Cat 2 listener
  React.useEffect(() => {
    setData({ categoryTwo: cat_2 ?? false })
  }, [cat_2])

  // * Cat 3 listener
  React.useEffect(() => {
    setData({ categoryThree: cat_3 ?? false })
  }, [cat_3])

  // * Key listener
  React.useEffect(() => {
    function handleKeyDown(event) {
      setData({ ...data, [event.key]: true })
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // * Video listener
  React.useEffect(() => {
    setInterval(() => {
      const videos = document.querySelectorAll('video')
      videos.forEach((video) => {
        video.addEventListener('ended', () => {
          setData({ ...data, videoEnded: true })
        })
      })
    }, 1000)
    return () => { }
  }, [])


  // * Button listener
  React.useEffect(() => {
    const allowButtonPress = () => {
      setButtonPressed(false)
    }
    const waitTime = 500

    function debounceButton() {
      setTimeout(() => {
        allowButtonPress()
      }, waitTime)
    }

    function buttonPressed({ color }) {
      setData({ buttonPressed: color })
    }
    if (websocketData?.data?.input?.buttons.green === 0 && !userPressed) {
      buttonPressed({ color: 'green' })
      setButtonPressed(true)
      debounceButton()
    }
    if (websocketData?.data?.input?.buttons.red === 0 && !userPressed) {
      buttonPressed({ color: 'red' })
      setButtonPressed(true)
      debounceButton()
    }
    return () => { }
  }, [buttons])

  // * Encoder listener
  React.useEffect(() => {
    function forwardOrBackwards({ curr }) {
      if (curr % 2 !== 0) {
        return
      }
      if (curr > oldValue) {
        setData({  forward: true })
      } else if (curr < oldValue) {
        setData({ backward: true })
      }
      setOldValue(curr)
    }
    if (websocketData?.data?.input?.encoder !== undefined) {
      forwardOrBackwards({ curr: websocketData?.data?.input?.encoder })
    }
    return () => { }
  }, [encoder])

  // * Distance listener
  React.useEffect(() => {
    const threshold = 5

    if (distance <= 0 || distance > 300) {
      return
    }

    if (distance > oldDistance - threshold && distance < oldDistance + threshold) {
      setOldDistance(distance)
      return
    }

    if (!personFound && distance > 250) {
      return
    }

    setOldDistance(distance)

    if (config.settings.personDetectionThresHold > distance && !personFound) {
      setPersonFound(true)
      setTimeout(() => {
        if (config.settings.personDetectionThresHold > distance) {
          setData({ person: true })
        } else {
          setPersonFound(false)
        }
      }, 5000)
    }

    if (config.settings.personDetectionThresHold < distance && personFound) {
      setPersonFound(false)
      setTimeout(() => {
        if (config.settings.personDetectionThresHold < distance) {
          setData({ personLeft: true })
        }
      }, 4000)
    }

    return () => { }
  }, [distance])


  React.useEffect(() => {
    if (data.startover) {
      setPersonFound(false)
    }
  }, [data.startover])

  return <eventEmitterData.Provider value={[data, setEvent]} {...{ children }} />
}

export function useEventEmitter() {
  const data = React.useContext(eventEmitterData)
  return data
}
