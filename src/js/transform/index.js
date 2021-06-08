import { logGeneratorError } from '../utils/logger'
import { freeTransform } from './freeTransform'

export function storyTransform(generator, story, constraints) {
  switch (generator) {
    case 'FreeTransform':
      freeTransform(story, constraints)
      break
    default:
      logGeneratorError(generator)
  }
}
