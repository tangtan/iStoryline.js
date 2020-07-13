import { logGeneratorError } from '../utils/logger'
import { smoothRender } from './smoothRender'
import { sketchRender } from './sketchRender'

export function storyRender(generator, story, constraints) {
  switch (generator) {
    case 'SmoothRender':
      smoothRender(story, constraints)
      break
    case 'SketchRender':
      sketchRender(story, constraints)
      break
    default:
      logGeneratorError(generator)
  }
}
