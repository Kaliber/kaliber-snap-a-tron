import { useEventEmitter } from '/machinery/EventEmitter'
import { AnimatedString } from '/components/effects/AnimatedString'
import { useWebsocketData } from '/machinery/WebsocketProvider'
import { HANDLE_LED } from '/machinery/WebsocketEvents'
import styles from './PromptCheck.css'

export function PromptCheck() {

  const [{}, send ] = useWebsocketData()

  // ? This holds the prompts as string
  const [firstPrompt, setFirstPrompt] = React.useState(null)
  const [secondPrompt, setSecondPrompt] = React.useState(null)
  const [thirdPrompt, setThirdPrompt] = React.useState(null)

  // ? This sets the state of categories. If cable connected sets to true
  const [firstCat, setFirstCat] = React.useState(false)
  const [secondCat, setSecondCat] = React.useState(false)
  const [thirdCat, setThirdCat] = React.useState(false)

  const readyAudio = new Audio('/assets/sounds/loaded.wav')
  const clickAudio = new Audio('/assets/sounds/click.wav')
  clickAudio.volume = 1
  readyAudio.volume = 1

  // ? This displays the category as string in the app
  const categories = {
    first: 'Artist',
    second: 'Style',
    third: 'Medium'
  }

  // ? This checks if all prompts have been entered
  const [allSelected, setAllSelected] = React.useState(false)

  // ? Sets error and allows input of error as string
  const [error, setError] = React.useState(null)

  // ? Checks if the instructions have been read
  const [instructions, setInstructions] = React.useState(true)

  const [event, setEvent] = useEventEmitter()

  React.useEffect(() => {
    const hasGenerated = localStorage.getItem('generated')
    const hasPrompt = localStorage.getItem('prompt')
    const generatedObject = JSON.parse(localStorage.getItem('prompt'))

    if (hasGenerated) {
      setInstructions(false)
      if (generatedObject) {
        setFirstPrompt(generatedObject.first)
        setSecondPrompt(generatedObject.second)
        setThirdPrompt(generatedObject.third)
        setFirstCat(true)
        setSecondCat(true)
        setThirdCat(true)
      }
    } else {
      send({ event: HANDLE_LED, data: {
        category1: 2, category2: 2, category3: 2,
        categoryOptions1: 0, categoryOptions2: 0, categoryOptions3: 0
      } })
    }
    if (hasPrompt) {
      setInstructions(false)
      setFirstPrompt(generatedObject.first)
      setSecondPrompt(generatedObject.second)
      setThirdPrompt(generatedObject.third)
      setFirstCat(true)
      setSecondCat(true)
      setThirdCat(true)
    }
  }, [])

  React.useEffect(() => {
    if (event.categoryOne === 0 || event.categoryTwo === 0 || event.categoryThree === 0 || event.categoryOne === 1 || event.categoryTwo === 1 || event.categoryThree === 1) {
      setInstructions(false)
    }

    if (event.categoryOne === 0) {
      if (firstPrompt) {
        setError(null)
      }
      send({ event: HANDLE_LED, data: { category1: 1, category2: 0, category3: 0, categoryOptions1: firstPrompt ? 1 : 2 } })
      setFirstCat(true)
    } else if (event.categoryOne === 1) {
      if (firstPrompt) {
        setError('First category not connected')
      }
      setFirstCat(false)
      setAllSelected(false)
      send({ event: HANDLE_LED, data: { category1: 2, categoryOptions1: 0 } })
    }
    if (event.categoryTwo === 0) {
      if (secondPrompt) {
        setError(null)
      }
      send({ event: HANDLE_LED, data: { category1: 0, category2: 1, category3: 0, categoryOptions2: secondPrompt ? 1 : 2 } })
      setSecondCat(true)
    } else if (event.categoryTwo === 1) {
      if (secondPrompt) {
        setError('Second category not connected')
      }
      setSecondCat(false)
      setAllSelected(false)
      send({ event: HANDLE_LED, data: { category2: 2, categoryOptions2: 0 } })
    }
    if (event.categoryThree === 0) {
      if (thirdPrompt) {
        setError(null)
      }
      send({ event: HANDLE_LED, data: { category1: 0, category2: 0, category3: 1, categoryOptions3: thirdPrompt ? 1 : 2 } })
      setThirdCat(true)
    } else if (event.categoryThree === 1) {
      if (thirdPrompt) {
        setError('Third category not connected')
      }
      setThirdCat(false)
      setAllSelected(false)
      send({ event: HANDLE_LED, data: { category3: 2, categoryOptions3: 0 } })
    }
  }, [event.categoryOne, event.categoryTwo, event.categoryThree])

  React.useEffect(() => {
    if (localStorage.getItem('wipe')) {
      return
    }

    if (event.firstInput || event.secondInput || event.thirdInput || event.removedFirst || event.removedSecond || event.removedThird || event.tooManyFirst || event.tooManySecond || event.tooManyThird) {
      setInstructions(false)
    }

    if (event.firstInput && firstCat) {
      setFirstPrompt(event.firstInput)
      send({ event: HANDLE_LED, data: { category1: 1, category2: secondPrompt ? 1 : 2, category3: thirdPrompt ? 1 : 2, categoryOptions1: 1 } })
      clickAudio.play()
      setError(null)
    }
    if (event.removedFirst) {
      setFirstPrompt(null)
      setError(null)
      setAllSelected(false)
      send({ event: HANDLE_LED, data: { categoryOptions1: firstCat ? 2 : 0 } })
    }
    if (event.tooManyFirst) {
      setError('Too many first inputs')
    }
    if (event.firstInput && !firstCat) {
      setError('First category not connected')
      setFirstPrompt(event.firstInput)
    }
    if (event.secondInput && secondCat) {
      setSecondPrompt(event.secondInput)
      send({ event: HANDLE_LED, data: { categoryOptions2: 1 } })
      clickAudio.play()
      setError(null)
    }
    if (event.removedSecond) {
      setSecondPrompt(null)
      setError(null)
      setAllSelected(false)
      send({ event: HANDLE_LED, data: { categoryOptions2: secondCat ? 2 : 0 } })
    }
    if (event.tooManySecond) {
      setError('Too many second inputs')
    }
    if (event.secondInput && !secondCat) {
      setError('Second category not connected')
      setSecondPrompt(event.secondInput)
    }
    if (event.thirdInput && thirdCat) {
      setThirdPrompt(event.thirdInput)
      send({ event: HANDLE_LED, data: { categoryOptions3: 1 } })
      clickAudio.play()
      setError(null)
    }
    if (event.removedThird) {
      setThirdPrompt(null)
      setError(null)
      setAllSelected(false)
      send({ event: HANDLE_LED, data: { categoryOptions3: thirdCat ? 2 : 0 } })
    }
    if (event.tooManyThird) {
      setError('Too many third inputs')
    }
    if (event.thirdInput && !thirdCat) {
      setError('Third category not connected')
      setThirdPrompt(event.thirdInput)
    }

    if (event.buttonPressed === 'green' && instructions) {
      setInstructions(false)
    }

    if (allSelected && event.buttonPressed === 'green') {
      const promptObj = {
        first: firstPrompt,
        second: secondPrompt,
        third: thirdPrompt,
      }
      localStorage.setItem('prompt', JSON.stringify(promptObj))
      setEvent('generateImage')
    }
    if (allSelected && event.buttonPressed === 'red') {
      setAllSelected(false)
    }
  }, [event])

  React.useEffect(() => {
    if (firstPrompt && secondPrompt && thirdPrompt && !error) {
      readyAudio.play()
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }

    if (firstPrompt || secondPrompt || thirdPrompt) {
      send({ event: HANDLE_LED, data: { category1: firstPrompt ? 1 : 2, category2: secondPrompt ? 1 : 2, category3: thirdPrompt ? 1 : 2 } })
    }
  }, [firstPrompt, secondPrompt, thirdPrompt, error])

  React.useEffect(() => {
    localStorage.removeItem('generated')
  }, [])

  return (
    <div style={{ height: '100vh' }}>
      { instructions &&
        <div className={styles.contentContainer}>
          <p>You are going to provide input for our machine. Please select a category by plugging in a cable to a category. Then plug in a cable to select an item.</p>
          <p className={styles.actionText}>[GREEN / LEFT] Got it</p>
        </div>
      }

      <h1>Plug-in selection.</h1>
      <br />
      <div className={styles.promptLines}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}><b style={{ backgroundColor: ( firstCat ? '#eaff00' : ' ' ), color: ( firstCat ? 'black' : '' ) }}>{categories.first}:</b>{ !error && <> {firstCat ? '>' : 'No cable connected'} {firstPrompt && <AnimatedString string={firstPrompt} />} </>}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}><b style={{ backgroundColor: ( secondCat ? '#eaff00' : ' ' ), color: ( secondCat ? 'black' : '' ) }}>{categories.second}:</b>{ !error && <> {secondCat ? '>' : 'No cable connected'} {secondPrompt && <AnimatedString string={secondPrompt} />} </>}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}><b style={{ backgroundColor: ( thirdCat ? '#eaff00' : ' ' ), color: ( thirdCat ? 'black' : '' ) }}>{categories.third}:</b>{ !error && <> {thirdCat ? '>' : 'No cable connected'} {thirdPrompt && <AnimatedString string={thirdPrompt} />} </>}</div>
      </div>
      <br />

      { error &&
        <div className={styles.confirmationContainer}>
          <div className={styles.confirmationInner}>
            {error}
            <div className={styles.Buttons}>
              <p>Add/Remove one or more entries</p>
            </div>
          </div>
        </div>
      }

      { allSelected &&
      <div className={styles.confirmationContainer}>
        <div className={styles.confirmationInner}>
          <p>Your current selection</p>
          <div className={styles.confirmationList}>
            <p><b>{categories.first}:</b> {firstPrompt}</p>
            <p><b>{categories.second}:</b> {secondPrompt}</p>
            <p><b>{categories.third}:</b> {thirdPrompt}</p>
          </div>
          <div className={styles.Buttons}>
            <p>[GREEN / LEFT] Accept</p> <p>[RED / RIGHT] Change input</p>
          </div>
        </div>
      </div>
      }
    </div>
  )
}
