const R = require('ramda')
const { openCsv, saveJson, years } = require('./utils')

const rows = openCsv('csv/pop.csv')

const json = rows.map(([geo, name, time, population]) => ({
  geo,
  year: Number(time),
  pop: Number(population),
}))

/*
[
  { geo: 'afg', year: 1800, pop: 3280000 },
  ...
]
*/

const getValueByYearAndGeo = (year, geo) => {
  const line = json.find(d => d.year === year && d.geo === geo)
  return line ? line.pop : undefined
}

const uniqGeos = R.uniq(json.map(R.prop('geo')))

const data = uniqGeos.map(geo => ({
  geo,
  values: years.map(year => getValueByYearAndGeo(year, geo))
}))

saveJson('pop.json', data)
