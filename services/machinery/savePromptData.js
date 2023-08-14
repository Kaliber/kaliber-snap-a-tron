const fs = require('fs')
const path = require('path')

function savePromptData({ prompt }) {
  const { first, second, third } = prompt
  const filePath = path.join(__dirname, 'data.json')
  const currentDate = new Date().toISOString().slice(0, 10)
  const data = {
    date: currentDate,
    first,
    second,
    third,
  }

  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fileData = '[]'
      } else {
        throw err
      }
    }

    const dataArray = JSON.parse(fileData)
    dataArray.push(data)

    fs.writeFile(filePath, JSON.stringify(dataArray), (err) => {
      if (err) throw err
      console.log('Chosen styles added to file.\n', data)
    })
  })
}

module.exports = savePromptData
