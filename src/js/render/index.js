import { logGeneratorError } from "../utils/logger";
import { smoothRender } from "./smoothRender";
import { sketchRender } from "./sketchRender";

export function storyRender(generator, story, constraints) {
  switch (generator) {
    case "SmoothRender":
      smoothRender(story, constraints);
    case "SketchRender":
      sketchRender(story, constraints);
    default:
      logGeneratorError(generator);
  }
}
