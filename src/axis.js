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
    .attr('y', BOTTOM + 7)
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