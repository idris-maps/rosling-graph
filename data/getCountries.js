const R = require('ramda')
const countriesFeatures = require('./110m_countries.json').features

const getCountryNameAndIds = feature => ({
  country: R.path(['properties', 'name_fr'], feature),
  geo: R.path(['properties', 'iso_a3'], feature).toLowerCase(),
  code: R.path(['properties', 'iso_n3'], feature),
})

module.exports = countriesFeatures.map(getCountryNameAndIds)