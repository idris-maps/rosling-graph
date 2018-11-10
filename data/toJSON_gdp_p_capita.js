const R = require('ramda')
const { openCsv, saveJson, years } = require('./utils')

const json = openCsv('csv/gdp_p_capita.csv')

const head = R.head(json)
const rows = R.tail(json)

const yearIsInRange = year => years.includes(year)

const yearIndexes = head
  .map((label, index) => ({ label, index }))
  .filter(({ index }) => index !== 0 && index !== 1)
  .map(({ label, index }) => ({ year: Number(label), index }))
  .filter(({ year }) => yearIsInRange(year))
  .map(R.prop('index'))

const getRowValueByIndex = row => index =>
  R.prop(index, R.pick([index], row))

const data = rows.map(row => ({
  geo: getRowValueByIndex(row)(1),
  values: yearIndexes.map(getRowValueByIndex(row)).map(Number),
}))

saveJson('gdp_p_capita.json', data)