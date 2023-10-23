const fs = require('fs-extra')

function storeError(error) {
  try {
    // Read the existing JSON file (if it exists)
    let existingErrors = []
    try {
      const fileContent = fs.readFileSync('errors.json', 'utf-8')
      existingErrors = JSON.parse(fileContent)
    } catch (err) {
      // File might not exist or be empty, that's okay
    }

    // Add the new error with current date to the array
    const currentDate = new Date()
    const formattedDate = currentDate.toISOString() // Adjust format as needed
    existingErrors.push({ date: formattedDate, error })

    // Write the updated array back to the file
    fs.writeFileSync('errors.json', JSON.stringify(existingErrors, null, 2))
  } catch (err) {
    console.error('Error storing error:', err)
  }
}

module.exports = { storeError }
