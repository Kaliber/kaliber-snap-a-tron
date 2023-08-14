const EventEmitter = require('events')
const express = require('express')

const arduinoEvents = new EventEmitter()
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer, { cors: { origin: '*' } })

setInterval(() => {
  arduinoEvents.emit('data', {
    data: {
      true: randomTrueOrFalse(),
      image: randomImage(),
      categories: {
        bank1: getFakeInputs(),
        bank2: getFakeInputs(),
        bank3: getFakeInputs(),
      },
      selected: getFakeInputs()
    }
  })
}, 1000)

io.on('connection', (socket) => {
  arduinoEvents.addListener('data', ({ data }) => {
    socket.emit('data', { data })
  })
})

// TODO use config
httpServer.listen(3001, () => {
  console.log('running on port 3001')
})

function getFakeInputs() {
  return Array(10).fill(0).map(x => randomNumber())
}

function randomNumber() {
  return Math.round(Math.random())
}

function randomTrueOrFalse() {
  return Math.random() >= 0.5
}

function randomImage() {
  const images = [
    'https://i.imgur.com/5Sun3TT.png',
    'https://i.imgur.com/boHmwjK.jpeg',
    'https://i.imgur.com/LjjNk4i.jpeg',
    'https://i.imgur.com/TVhSbO5.jpeg',
    'https://i.imgur.com/IghaawT.gif',
    'https://media4.giphy.com/media/j0eRJzyW7XjMpu1Pqd/giphy.gif',
    'https://media0.giphy.com/media/P7JmDW7IkB7TW/giphy.gif',
    'https://media1.giphy.com/media/WRuBiZKB6xgsS9DrFA/giphy.gif',
    'https://media1.giphy.com/media/g01FakEbcUua6yM34a/giphy.gif'
  ]

  return images[Math.floor(Math.random() * images.length)]
}
