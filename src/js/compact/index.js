import { logGeneratorError } from "../utils/logger";
import { greedySlotCompact } from "./greedySlotCompact";
import { opCompact } from "./opCompact";
import { opSlotCompact } from "./opSlotCompact";

export function storyCompact(generator, story, constraints) {
  switch (generator) {
    case "GreedySlotCompact":
      greedySlotCompact(story, constraints);
    case "OpCompact":
      opCompact(story, constraints);
    case "OpSlotCompact":
      opSlotCompact(story, constraints);
    default:
      logGeneratorError(generator);
  }
}
