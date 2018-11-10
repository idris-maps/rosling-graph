import { select } from 'd3-selection'
import { getColorByRegion } from './scales'

function onBubbleMouseOver(svg) {
  return function(d) {
    const current = select(this)
    current
      .attr('fill', 'white')
      .attr('stroke', 'black')
    svg.append('text')
      .attr('id', 'country-name')
      .attr('text-anchor', 'middle')
      .attr('x', parseFloat(current.attr('cx')))
      .attr('y', parseFloat(current.attr('cy') - 5))
      .text(d.country)
  }
}

function onBubbleMouseOut(d) {
  select(this)
    .attr('fill', getColorByRegion)
    .attr('stroke', getColorByRegion)
  select('#country-name').remove()
}

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
    .on('mouseover', onBubbleMouseOver(svg))
    .on('mouseout', onBubbleMouseOut)