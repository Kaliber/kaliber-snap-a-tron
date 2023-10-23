const path = require('path')
const fs = require('fs-extra')
const EventEmitter = require('events')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const { server } = require('@kaliber/config')
const { IMAGE_CAPTURED, IMAGE_PROCESSED, PRINT_IMAGE, IMAGE_SEND_TO_PRINTER, RING_PHONE, MUTE_PHONE, DATA, PHONE_DATA, PROCES_STEP, HANDLE_LED } = require('./machinery/WebsocketEvents.js')
const { processImage } = require('./machinery/processImage')
const { storeError } = require('./machinery/storeError')
const { printFile } = require('./machinery/printFile')
const { WebSocketServer } = require('ws')

const IMAGE_BASE_OUTPUT_PATH = path.join(process.cwd(), 'target', 'public', 'generated')
if (process.platform === 'win32') {
  fs.emptyDir(IMAGE_BASE_OUTPUT_PATH) // making sure the generated folder is empty on start
}

const wss = new WebSocketServer({ port: server.websocket.port })

const arduinoEvents = new EventEmitter()

const inputPort = new SerialPort({ baudRate: server.arduino.input.baudRate, path: server.arduino.input.port })
const phonePort = new SerialPort({ baudRate: server.arduino.phone.baudRate, path: server.arduino.phone.port })

const inputParser = inputPort.pipe(new ReadlineParser({ delimiter: '\n' }))
const phoneParser = phonePort.pipe(new ReadlineParser({ delimiter: '\n' }))

let state = {
  processing: false,
  lastInputState: '',
  lastPhoneState: ''
}

inputParser.on('data', (data) => {
  try {
    const parsedData = JSON.parse(data)

    if (state.lastInputState !== JSON.stringify(parsedData)) {
      arduinoEvents.emit('inputData', { data: { input: parsedData } })
    }

    state.lastInputState = JSON.stringify(parsedData)
  } catch (e) {
    console.log('A json parsing error has occurred but this is probably not a problem')
    storeError(e)
  }
})

phoneParser.on('data', (data) => {
  try {
    const parsedData = JSON.parse(data)
    if (state.lastPhoneState !== JSON.stringify(parsedData)) {
      arduinoEvents.emit('phoneData', { data: parsedData })
    }

    state.lastPhoneState = JSON.stringify(parsedData)
  } catch (e) {
    console.log('A json parsing error has occurred but this is probably not a problem')
    storeError(e)
  }
})

wss.on('connection', (ws) => {
  arduinoEvents.addListener('inputData', ({ data }) => {
    ws.send(JSON.stringify({ event: DATA, data }))
  })

  arduinoEvents.addListener('phoneData', ({ data }) => {
    ws.send(JSON.stringify({ event: PHONE_DATA, data }))
  })

  function setProgress(percentage) {
    ws.send(JSON.stringify({ event: PROCES_STEP, data: { percentage } }))
  }

  ws.on('message', (e) => {
    try {
      const input = e.toString()
      const { event, data } = JSON.parse(input)
      // console.log(event, data)

      switch (event) {
        case IMAGE_CAPTURED:
          if (state.processing)
            return

          state.processing = true
          processImage({
            baseOutputPath: IMAGE_BASE_OUTPUT_PATH,
            base64Data: data.blob,
            prompt: data.prompt,
            progress: setProgress
          })
            .then(({ photoSrc, imageWithAiFilter, imageWithOverlay, src, srcBase64 }) => {
              state.processing = false
              setTimeout(
                () => {
                  ws.send(JSON.stringify({
                    event: IMAGE_PROCESSED,
                    data: { photoSrc, imageWithAiFilter, imageWithOverlay, src, srcBase64 }
                  }))
                },
                100
              )
            })
            .catch((e) => {
              state.processing = false
              console.log(e)
              storeError(e)
            })
          break
        case PRINT_IMAGE:
          const fileToPrintPath = path.join(process.cwd(), 'target', data.filePath)
          console.log('Sending file to printer!')

          printFile({ path: fileToPrintPath })
            .then(({ jobId }) => {
              ws.send(JSON.stringify({ event: IMAGE_SEND_TO_PRINTER, data: { jobId } }))
            })
            .catch(err => {
              console.warn(err)
              storeError(e)
            })

          break
        case RING_PHONE:
          phonePort.write(`${JSON.stringify({ call: true })}\n`, (err) => {
            if (err) console.warn(err)
          })

          break
        case MUTE_PHONE:
          phonePort.write(`${JSON.stringify({ call: false })}\n`, (err) => {
            if (err) console.warn(err)
          })

          break
        case HANDLE_LED:
          phonePort.write(`${JSON.stringify({ ledState: data })}\n`, (err) => {
            if (err) console.warn(err)
          })
          break
        default:
          console.log(event)
      }
    } catch (e) {
      console.warn(e)
      storeError(e)
    }
  })
})
