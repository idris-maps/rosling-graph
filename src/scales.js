import { scaleLinear, scaleLog, scalePow } from 'd3-scale'
import { WIDTH, HEIGHT } from './config'

export const yearIndex = scaleLinear().domain([1950, 2015]).range([0, 65])
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