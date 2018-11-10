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

const updateYearDisplayByYear = (yearDisplay, year) =>
  yearDisplay.text(year)

export const setYear = (year, bubbles, yearDisplay) => {
  const index = yearIndex(year)
  updateBubblesByYearIndex(bubbles, index)
  updateYearDisplayByYear(yearDisplay, year)
}