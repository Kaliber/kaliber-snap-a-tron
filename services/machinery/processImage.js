const sharp = require('sharp')
const path = require('path')
const fs = require('fs-extra')
const { v4: uuid } = require('uuid')
const { generate } = require('./stableDiffusionGenerate')

async function processImage({ baseOutputPath, base64Data, prompt, progress }) {
  const id = uuid()
  const workingDir = path.join(baseOutputPath, id)
  await fs.ensureDirSync(workingDir)

  await savePromptData({ prompt })
  console.time('generateImage')

  progress(0)

  const photoSrc = await storeDataAsImageToDisk({
    data: base64Data,
    out: path.join(workingDir, 'input.png'),
  })

  const imageWithAiFilter = await sendImageToAi({
    src: photoSrc,
    prompts: prompt,
    out: path.join(workingDir, `ai.png`),
    onProgress: (percentage) => progress(percentage)
  })

  const imageWithOverlay = await combineImageWithOverlay({
    input: imageWithAiFilter,
    out: path.join(workingDir, `overlay.png`)
  })

  const srcBase64 = `data:image/png;base64,${getImageAsBase64String({ source: imageWithOverlay })}`

  progress(100)

  console.timeEnd('generateImage')

  return {
    photoSrc,
    imageWithAiFilter,
    imageWithOverlay,
    src: `/public/generated/${id}/overlay.png`,
    srcBase64
  }
}

async function storeDataAsImageToDisk({ out, data }) {
  console.log('storeDataAsImageToDisk')
  await fs.writeFileSync(out, data.replace('data:image/png;base64,', ''), 'base64')

  return out
}

async function sendImageToAi({ src, prompts, out, onProgress }) {
  console.log('sendImageToAi')

  await generate({ src, prompts, out, onProgress })
  return out
}

async function combineImageWithOverlay({ input, out }) {
  console.log('combineImageWithOverlay')

  const profileBuffer = await sharp(input)
    .resize({ width: 1146, height: 1146 }).toBuffer()

  await sharp(path.join(process.cwd(), 'services', 'images', 'overlay.png'))
    .composite([{ input: profileBuffer, top: 176, left: 0 }])
    .sharpen()
    .toFile(out)

  return out
}

function getImageAsBase64String({ source }) {
  const contents = fs.readFileSync(source)
  return Buffer.from(contents).toString('base64')
}

async function savePromptData({ prompt }) {
  const { first: artist, second: style, third: medium } = prompt
  const filePath = path.join(__dirname, 'data.json')
  const currentDate = new Date().toISOString().slice(0, 10)
  const data = {
    date: currentDate,
    artist,
    style,
    medium,
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


module.exports = {
  processImage
}
