import { select } from 'd3-selection'
import { WIDTH, HEIGHT } from './config'
import createBubbles from './bubbles'
import { setYear } from './events'
import addAxis from './axis'

const svg = select('#graph').append('svg')
  .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

const slider = document.getElementById('slider')

const yearDisplay = svg.append('text')
  .attr('id', 'year')
  .attr('x', WIDTH - 20)
  .attr('y', HEIGHT - 20)
  .attr('text-anchor', 'end')
  .text(null)

const getData = () =>
  fetch('data.json')
    .then(res => res.json())

const drawGraph = ({ years, countries }) => {
  addAxis(svg)
  const bubbles = createBubbles(svg, countries)
  setYear(1950, bubbles, yearDisplay)
  slider.addEventListener('input', e => setYear(e.target.value, bubbles, yearDisplay))
}

window.onload = () =>
  getData()
    .then(drawGraph)
