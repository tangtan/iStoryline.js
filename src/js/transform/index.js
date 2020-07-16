import { logGeneratorError } from '../utils/logger'
import { freeTransform } from './freeTransform'
import { circleTransform } from './circleTransform'

export function storyTransform(generator, story, constraints) {
  switch (generator) {
    case 'CircleTransform':
      circleTransform(story, constraints)
      break
    case 'FreeTransform':
      freeTransform(story, constraints)
      break
    default:
      logGeneratorError(generator)
  }
}
