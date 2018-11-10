const fs = require('fs')

const getRows = csv => csv
  .split('\n')
  .map(row => row.split(','))

const openCsv = path =>
  getRows(fs.readFileSync(path, 'utf-8'))

const saveJson = (path, data) =>
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')

const years = Array.from(Array(66)).map((d, i) => i + 1950)

module.exports = {
  openCsv,
  saveJson,
  years,
}