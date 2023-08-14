module.exports = {
  client: {
    settings: {
      personDetectionThresHold: 120
    },
    websocket: {
      port: 3001,
      host: 'localhost'
    },
  },
  server: {
    websocket: {
      port: 3001,
    },
    stableDiffusion: {
      apiUrl: 'https://your-stable-diffusion-endpoint.proxy.runpod.net',
      username: 'username',
      password: 'password'
    },
    arduino: {
      input: {
        baudRate: 115200,
        port: ''
      },
      phone: {
        baudRate: 115200,
        port: ''
      }
    }
  }
}
