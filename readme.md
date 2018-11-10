# Graphique Rosling

## Hans Rosling

[Page wikipedia](https://en.wikipedia.org/wiki/Hans_Rosling)

[Video](https://www.youtube.com/watch?v=jbkSRLYSojo)

## Les données

### Source

[Gapminder](https://www.gapminder.org/data/documentation/gd000/)

TODO ADD LINKS

* PNB par habitant[gdp_p_capita.csv]()
* Espérance de vie[life_expect.csv]() 
* Population [pop.csv]()
* Régions [regions.csv]()

### Préparer les données

#### `fs`

[Documentation](https://nodejs.org/api/fs.html)

Ouvrir un fichier CSV

```javascript
const fs = require('fs')

const csv = fs.readFileSync(path, 'utf-8')
```

Extraire les cellules

```javascript
const getRows = csv => csv
  .split('\n')
  .map(row => row.split(','))

const openCsv = path =>
  getRows(fs.readFileSync(path, 'utf-8'))
```

[.split() sur MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)

Sauver un fichier JSON

```javascript
const saveJson = (path, data) =>
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
```

#### Joindre les tables

Trois de nos fichiers ont une colonne `geo` qui correspond au code [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3).

`life_expect.csv` n'a pas de colonne `geo` mais une colonne `country_code`. Pour faire le lien nous allons utiliser [110m_countries.json] de [Natural earth] qui a les deux.

Extraire le code ISO et le code pays de `110m_countries.json`

Fichier `getCountries.js`

```javascript
const R = require('ramda')
const countriesFeatures = require('10m_countries.json').features

const getCountryNameAndIds = feature => ({
  country: R.path(['properties', 'name_fr'], feature),
  geo: R.path(['properties', 'iso_a3'], feature),
  code: R.path(['properties', 'iso_n3'], feature),
})

module.exports = countriesFeatures.map(getCountryNameAndIds)
```

### Extraire les données des csv

`life_expect.csv` est aussi le fichier qui couvre le moins d'années de 1950 à 2015, nous ne pouvons donc utiliser que ces années là.

```javascript
const years = Array.from(Array(66)).map((d, i) => i + 1950)
```

Pour chaque fichier CSV nous allons demander une liste de valeurs par pays pour ces années.

* `toJSON_life_expect.js`

```javascript
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
```

* `toJSON_pop.js`

```javascript
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
```

* `toJSON_gdp_p_capita.js`

```javascript
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
```

* `toJSON_regions.js`

```javascript
const R = require('ramda')
const { openCsv, saveJson } = require('./utils')

const rows = R.tail(openCsv('csv/regions.csv'))

const data = rows.map(([geo, region]) => ({ geo, region }))

saveJson('regions.json', data)
```

Nous avons maintenant:

TODO links

- [gdp_p_capita.json]()
- [life_expect.json]()
- [pop.json]()
- [regions.json]()

### Créer le fichier final

TODO link

[prepareData.js]()

```javascript
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

// enlever les pays avec données incomplètes

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
```

TODO link

[data.json]()

## Le graphique

### Mise en place

Les dépendances de développement:

```bash
npm install @babel/core http-server webpack webpack-cli  --save-dev
```

Les modules d3 dont nous avons besoin:

```bash
npm install d3-selection d3-scale --save
```

Créer les dossiers `src` et `dist`.

Dans `package.json`

```json
{
  "scripts": {
    "serve": "http-server dist",
    "watch": "webpack --watch",
    "webpack": "webpack"
  },
}
```

Dans `dist`, créer un fichier `index.html`

```html
<html>
  <head>
    <meta charset="utf-8">
    <title>Graphique Rosling</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div id="graph"></div>
    <input id="slider" type="range" min="1950" max="2015" value="1950" />
    <script src="bundle.js"></script>
  </body>
</html>
```

Nous allons écrire le code dans `src`

### Les constantes

TODO link

[config.js]()

```javascript
export const WIDTH = 500
export const HEIGHT = 200
```

### Les éléments

TODO link

[index.js]()

```javascript
import { select } from 'd3'

const svg = select('#graph').append('svg')
  .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

const slider = document.getElementById('slider')
```

Nous allons aussi charger les données lors du chargement de la page. Copions `data/data.json` dans `dist`.

```javascript
const getData = fetch('data.json')
  .then(res => res.json())

const drawGraph = ({ years, countries }) => {
  // dessiner le graphique ici
}

window.onload = () =>
  getData()
    .then(drawGraph(svg, slider))
```

Une fois les données chargée nous allons appeller la fonction `drawGraph`.

### Les échelles et une fonction pour la couleur régionale

TODO link

[scales.js]()

```javascript
import { scaleLinear, scaleLog, scalePow } from 'd3'
import { WIDTH, HEIGHT } from './config'

export const yearIndex = d3.scaleLinear().domain([1950, 2015]).range([0, 65])
export const xScale = scaleLog().domain([500, 140000]).range([0, WIDTH])
export const yScale = scaleLinear().domain([30, 85]).range([HEIGHT, 0])
export const rScale = scalePow().domain([25000, 1000000000]).range([2, 25])
export const getColorByRegion = ({ region }) => {
  switch(region) {
    case 'south_asia':return '#66c2a5'
    case 'europe_central_asia': return '#fc8d62'
    case 'middle_east_north_africa': return '#8da0cb'
    case 'sub_saharan_africa': return '#e78ac3'
    case 'america': return '#a6d854'
    default: return '#ffd92f'
  }
}
```

### Les bulles

TODO link

[bubbles.js]()

```javascript
import { getColorByRegion } from './scales'

export default (svg, countries) =>
  svg.selectAll('circle')
    // lier les données
    .data(countries)
    .enter()
    .append('circle')
    // une classe pour le CSS
    .attr('class', 'bubble')
    // la couleur en fonction de la région
    .attr('fill', getColorByRegion)
    .attr('stroke', getColorByRegion)
```

Import dans `index.js`

```javascript
import createBubbles from './bubbles'

// ...

const drawGraph = ({ years, countries }) => {
  const bubbles = createBubbles(svg, countries)
}
```

### Les événements

TODO links

[events.js]()

Nous bulles n'ont pas encore de positions / tailles elles vont être calculées en fonction de l'annéee

```javascript
import {
  yearIndex,
  xScale,
  yScale,
  rScale,
} from './scales'

const updateBubblesByYearIndex = (bubbles, yearIndex) =>
    bubbles
      .attr('cx', d => xScale(d.gdpCapita[yearIndex]))
      .attr('cy', d => yScale(d.lifeExpect[yearIndex]))
      .attr('r', d => rScale(d.pop[yearIndex]))

export const setYear = (year, bubbles) => {
  const index = yearIndex(year)
  updateBubblesByYearIndex(bubbles, index)
}
```

Dans `index.js`

```javascript
const drawGraph = ({ years, countries }) => {
  const bubbles = createBubbles(svg, countries)
  setYear(1950, bubbles)
}
```

Nous pouvons maintenant voir les bulles. Il nous faut mettre à jour les bulles quand la valeur de `slider` change.

```javascript
const drawGraph = ({ years, countries }) => {
  const bubbles = createBubbles(svg, countries)
  setYear(1950, bubbles)
  slider.addEventListener('input', e => setYear(e.target.value, bubbles))
}
```

### Style

`dist/style.css`

```css
html, body, #graph, #slider {
  margin: 0;
  padding: 0;
}
body {
  font-family: Arial, Helvetica, sans-serif
}
#graph, #slider {
  width: 100%;
}
.bubble {
  fill-opacity: 0.4;
  stroke-opacity: 0.8;
  stroke-width: 0.5;
}
```

### Afficher l'année

Dans `index.js`

```javascript
const yearDisplay = svg.append('text')
  .attr('id', 'year')
  .attr('x', WIDTH - 20)
  .attr('y', HEIGHT - 20)
  .attr('text-anchor', 'end')
  .text(null)

// ...

const drawGraph = ({ years, countries }) => {
  const bubbles = createBubbles(svg, countries)
  setYear(1950, bubbles, yearDisplay)
  slider.addEventListener('input', e => setYear(e.target.value, bubbles, yearDisplay))
}
```

Dans `events.js`

```javascript
const updateYearDisplayByYear = (yearDisplay, year) =>
  yearDisplay.text(year)

export const setYear = (year, bubbles, yearDisplay) => {
  const index = yearIndex(year)
  updateBubblesByYearIndex(bubbles, index)
  updateYearDisplayByYear(yearDisplay, year)
}
```

Dans `dist/style.css`

```css
#year {
  font-size: 100;
  opacity: 0.2;
}
```

### Afficher le nom du pays en survolant une bulle

`bubbles.js`

```javascript
import { select } from 'd3-selection'
import { getColorByRegion } from './scales'

function onBubbleMouseOver(svg) {
  return function(d) {
    const current = select(this)
    current.attr('fill-opacity', 1)
    svg.append('text')
      .attr('id', 'country-name')
      .attr('text-anchor', 'middle')
      .attr('x', parseFloat(current.attr('cx')))
      .attr('y', parseFloat(current.attr('cy') - 5))
      .text(d.country)
  }
}

function onBubbleMouseOut(d) {
  select(this).attr('stroke', getColorByRegion)
  select('#country-name').remove()
}

export default (svg, countries) =>
  svg.selectAll('circle')
    .data(countries)
    .enter()
    .append('circle')
    .attr('class', 'bubble')
    .attr('fill', getColorByRegion)
    .attr('stroke', getColorByRegion)
    .on('mouseover', onBubbleMouseOver(svg))
    .on('mouseout', onBubbleMouseOut)
```

Dans `dist/style.css`

```css
#country-name {
  text-anchor: 'middle';
  font-size: 5;
}
```

### Légende

`axis.js`

```javascript
import { WIDTH, HEIGHT } from './config'
import { xScale, yScale } from './scales'

const TOP = 10
const BOTTOM = HEIGHT - 10
const LEFT = 10
const RIGHT = WIDTH - 10

export default (svg) => {
  const xAxis = svg.append('g')
  const yAxis = svg.append('g')

  xAxis.append('line')
    .attr('x1', LEFT)
    .attr('x2', RIGHT)
    .attr('y1', BOTTOM)
    .attr('y2', BOTTOM)
    .attr('stroke', 'black')
    .attr('opacity', 0.5)
    .attr('stroke-width', 0.5)
  
  xAxis.selectAll('text')
    .data([1000, 4000, 16000, 64000])
    .enter()
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', xScale)
    .attr('y', BOTTOM + 10)
    .attr('text-anchor', 'middle')
    .text(d => d)
  
  xAxis.append('text')
    .attr('class', 'axis-label')
    .attr('x', RIGHT)
    .attr('y', BOTTOM - 3)
    .attr('text-anchor', 'end')
    .text('PNB par habitant')

  yAxis.append('line')
    .attr('x1', LEFT)
    .attr('x2', LEFT)
    .attr('y1', TOP)
    .attr('y2', BOTTOM)
    .attr('stroke', 'black')
    .attr('opacity', 0.5)
    .attr('stroke-width', 0.5)

  yAxis.append('text')
    .attr('class', 'axis-label')
    .attr('x', LEFT + 5)
    .attr('y', TOP)
    .attr('transform', `rotate(90, ${LEFT + 5}, ${TOP})`)
    .text('Espérance de vie')

  yAxis.selectAll('text')
    .data([40, 60, 80])
    .enter()
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', LEFT - 2)
    .attr('y', d => yScale(d) - 5)
    .attr('text-anchor', 'end')
    .text(d => d)
}
```

Dans `index.js`

```javascript
import addAxis from './axis'

// ...

const drawGraph = ({ years, countries }) => {
  addAxis(svg)
  const bubbles = createBubbles(svg, countries)
  setYear(1950, bubbles, yearDisplay)
  slider.addEventListener('input', e => setYear(e.target.value, bubbles, yearDisplay))
}
```

Dans `style.css`

```css
.axis-label {
  font-size: 5;
}
```