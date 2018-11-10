const R = require('ramda')
const { saveJson, years } = require('./utils')
const countries = require('./getCountries')

const lifeExpectData = require('./life_expect.json')
const gdpCapitaData = require('./gdp_p_capita.json')
const popData = require('./pop.json')
const regionsData = require('./regions.json')

const getValuesByGeo = (data, key) => ({ geo }) => {
  const line = data.find(d => d.geo === geo)
  return line ? line[key] : undefined
}

const getGdpCapita = getValuesByGeo(gdpCapitaData, 'values')
const getPop = getValuesByGeo(popData, 'values')
const getRegion = getValuesByGeo(regionsData, 'region')
const getLifeExpect = ({ code }) => {
  const line = lifeExpectData.find(d => d.code === code)
  return line ? line.values : undefined
}

const data = countries.map(country => ({
  ...country,
  region: getRegion(country),
  gdpCapita: getGdpCapita(country),
  pop: getPop(country),
  lifeExpect: getLifeExpect(country),
}))

// clean

const hasNullValues = values =>
  values.reduce((result, value) => result ? result : R.isNil(value), false)

const valueIsNotComplete = values => {
  if (!values) {
    return true
  }
  if (values.length !== years.length) {
    return true
  }
  if (hasNullValues(values)) {
    return true
  }
  return false
}

const countryHasAllValues = country => {
  const noPop = R.not(valueIsNotComplete(country.pop))
  const noLife = R.not(valueIsNotComplete(country.lifeExpect))
  const noGdp = R.not(valueIsNotComplete(country.gdpCapita))
  return noPop && noLife && noGdp
}

saveJson('data.json', { years, countries: data.filter(countryHasAllValues) })
