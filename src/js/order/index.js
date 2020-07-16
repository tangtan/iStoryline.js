import { logGeneratorError } from '../utils/logger'
import { locationSort } from './locationSort'
import { greedySort } from './greedySort'

export function storyOrder(generator, story, constraints) {
  switch (generator) {
    case 'GreedyOrder':
      greedySort(story, constraints)
      break
    case 'LocationOrder':
      locationSort(story, constraints)
      break
    default:
      logGeneratorError(generator)
  }
}
