import { logGeneratorError } from '../utils/logger'
import { greedySlotCompact } from './greedySlotCompact'
import { opCompact } from './opCompact'
import { opSlotCompact } from './opSlotCompact'

export function storyCompact(generator, story, constraints) {
  switch (generator) {
    case 'GreedySlotCompact':
      greedySlotCompact(story, constraints)
      break
    case 'OpCompact':
      opCompact(story, constraints)
      break
    case 'OpSlotCompact':
      opSlotCompact(story, constraints)
      break
    default:
      logGeneratorError(generator)
  }
}
