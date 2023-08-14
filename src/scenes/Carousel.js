import { useEventEmitter } from '/machinery/EventEmitter'

export function Carousel() {
  const [input] = useEventEmitter()
  const slides = [
    {
      title: 'Foto 1',
      content: 'This is the first slide',
    },
    {
      title: 'Foto 2',
      content: 'This is the second slide',
    },
    {
      title: 'Foto 3',
      content: 'This is the third slide',
    },
  ]

  const [activeSlide, setActiveSlide] = React.useState(0)

  React.useEffect(() => {
    if (input.forward && activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1)
    }
    if (input.backward && activeSlide > 0) {
      setActiveSlide(activeSlide - 1)
    }
  }, [input])

  return (
    <>
      {slides.map((slide, index) => {
        if (index === activeSlide) {
          return (
            <div key={index}>
              <h1>{slide.title}</h1>
              <p>{slide.content}</p>
            </div>
          )
        }
      }
      )}
    </>
  )
}
