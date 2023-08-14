const nodePrinter = require('@thiagoelg/node-printer')
const { exec } = require('node:child_process')

function printFile({ path }) {
  return new Promise((resolve, reject) => {
    const printers = nodePrinter.getPrinters()

    if (printers.length <= 0) {
      reject('No printers found')
    }

    const printerName = nodePrinter.getDefaultPrinterName()

    if (process.platform !== 'win32') {
      nodePrinter.printFile({
        filename: path,
        options: {
          media: 'dnp4x6',
        },
        printer: printerName,
        success: (jobID) => {
          resolve({ jobId: jobID })
        },
        error: (err) => {
          reject(err)
        }
      })
    } else {
      // not yet implemented, use printDirect and text
      exec(`rundll32 C:\\WINDOWS\\system32\\shimgvw.dll,ImageView_PrintTo "${path}" "DP-QW410"`)
      resolve({ jobId: 1 })
    }
  })
}


module.exports = {
  printFile
}
