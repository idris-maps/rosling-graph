const R = require('ramda')
const { openCsv, saveJson, years } = require('./utils')

const rows = openCsv('csv/life_expect.csv')


const json = rows.map(([region, country_code, year, life_expect]) => ({
  code: country_code,
  year: Number(year),
  life_expect: Number(life_expect),
}))

/*
[
  { country_code: '900', year: 1950, lifeExpect: 45.78 },
  ...
]
*/

const getValueByYearAndCode = (year, code) => {
  const line = json.find(d => d.year === year && d.code === code)
  return line ? line.life_expect : undefined
}

const uniqCodes = R.uniq(json.map(R.prop('code')))

const data = uniqCodes.map(code => ({
  code,
  values: years.map(year => getValueByYearAndCode(year, code))
}))

saveJson('life_expect.json', data)

