const R = require('ramda')
const { openCsv, saveJson } = require('./utils')

const rows = R.tail(openCsv('csv/regions.csv'))

const data = rows.map(([geo, region]) => ({ geo, region }))

saveJson('regions.json', data)