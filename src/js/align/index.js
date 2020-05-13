import { greedyAlign } from "./greedyAlign";
import { logGeneratorError } from "../utils/logger";

export function storyAlign(generator, story, constraints) {
  switch (generator) {
    case "GreedyAlign":
      return greedyAlign(story, constraints);
    default:
      logGeneratorError(generator);
  }
}
