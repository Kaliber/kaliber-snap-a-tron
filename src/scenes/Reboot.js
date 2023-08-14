import { useEventEmitter } from '/machinery/EventEmitter'
export function Reboot() {
  const [events, setEvent] = useEventEmitter()

  const [step, setStep] = React.useState(0)
  const REBOOT_STEPS = {
    0: 'Wiping data...',
    1: 'Resetting system...',
    2: 'Applying updates...',
    3: 'Rebooting...',
  }

  const removalObjects = [
    'picture', 'wipe', 'generated', 'prompt'
  ]

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep(step => step + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {

    function handleClearLocalStorage() {
      removalObjects.forEach((object) => {
        localStorage.removeItem(object)
      })
    }

    if (step === 3) {
      handleClearLocalStorage()
      setTimeout(() => {
        setEvent('startover')
      }, 1000)
    }
  }, [step])

  return (
    <div>
      {REBOOT_STEPS[step]}
    </div>
  )
}
