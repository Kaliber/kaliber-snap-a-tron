const fetch = require('node-fetch').default
const fs = require('fs-extra')
const { server: { stableDiffusion } } = require('@kaliber/config')

const BASIC_AUTH = Buffer.from([stableDiffusion.username, stableDiffusion.password].join(':')).toString('base64')

async function generate({ src, prompts, out, onProgress }) {
  const imageData = getImageAsBase64String({ source: src })

  const body = {
    enable_hr: false,
    denoising_strength: 0.75,
    prompt: `Portrait by the artist (({${prompts.first}}:1.4)), ((({${prompts.second}}:1.2))), colorful spiral patterns, ({${prompts.third}}:1.1). Highly detailed`,
    seed: -1,
    sampler_name: 'Euler',
    batch_size: 1,
    n_iter: 1,
    steps: 30,
    cfg_scale: 7,
    width: 512,
    height: 512,
    restore_faces: false,
    tiling: false,
    do_not_save_samples: false,
    do_not_save_grid: false,
    negative_prompt: 'Dark lighting, grey, pixels, black and white, old, pixelated, face of art artist, creepy, somber, wrong eye color, grey skin, misshapen ,blurry, low res, low polly, closed eyes, watermark, text, Murky, Dull, Faded, Sallow Grimy, deformed, dehydrated, disfigured, duplicate, error, jpeg artifacts, low quality, morbid, mutation, mutilated, poorly drawn face, signature, text, username, worst quality, lowres, cropped, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, deformed, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck',
    sampler_index: 'Euler',
    send_images: true,
    save_images: false,
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            input_image: imageData,
            module: 'depth_zoe',
            model: 'control_v11f1p_sd15_depth [cfd03158]',
            weight: 1,
            guidance_start: 0,
            guidance_end: 1,
          },
          {
            input_image: imageData,
            module: 'canny',
            model: 'control_v11p_sd15_canny [d14c016b]',
            weight: 0.6,
            guidance_start: 0,
            guidance_end: 1,
          },
        ]
      }
    },
  }

  let response

  const progressInterval = setInterval(async () => {
    const {
      progress: progressRaw = 0,
      state: { job_count = -1 }
    } = await fetch(`${stableDiffusion.apiUrl}/sdapi/v1/progress?skip_current_image=false`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${BASIC_AUTH}`
      },
    }).then(res => res.json())

    const progress = job_count === 0
      ? 99 : (
        job_count < 0 ? 0 : Math.round(progressRaw * 100)
      )
    onProgress(progress)
  }, 1500)

  try {
    response = await fetch(`${stableDiffusion.apiUrl}/sdapi/v1/txt2img`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${BASIC_AUTH}`
      },
    })
  } catch (error) {
    console.log('There was an error', error)
  } finally {
    progressInterval && clearInterval(progressInterval)
  }

  const json = await response.json()
  const images = json.images
  const [image] = images.length ? images : []

  console.log(json)

  if (image) {
    fs.writeFileSync(out, image, 'base64')
  }
}

function getImageAsBase64String({ source }) {
  const contents = fs.readFileSync(source)
  return Buffer.from(contents).toString('base64')
}

module.exports = {
  generate
}
