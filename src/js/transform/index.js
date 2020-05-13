import { logGeneratorError } from "../utils/logger";
import { freeTransform } from "./freeTransform";
import { circleTransform } from "./circleTransform";

export function storyTransform(generator, story, constraints) {
  switch (generator) {
    case "CircleTransform":
      circleTransform(story, constraints);
    case "FreeTransform":
      freeTransform(story, constraints);
    default:
      logGeneratorError(generator);
  }
}
